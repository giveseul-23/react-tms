import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { usePopup } from "@/app/components/popup/PopupContext";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { oilPriceByGasStationApi as api } from "./OilPriceByGasStationApi";
import { MENU_CODE } from "./OilPriceByGasStation";
import { OpinetGasPop } from "./popup/OpinetGasPop";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  OilPriceByGasStationModel,
  OilPricePoint,
  GridKey,
} from "./OilPriceByGasStationModel";

interface Args {
  model: OilPriceByGasStationModel;
}

const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

// 응답 dsOut 추출
function extractRows(res: any): any[] {
  return res?.data?.data?.dsOut ?? res?.data?.rows ?? [];
}

// 서버 getTimeData — 일자별 평균유가 시계열 포인트로 변환
function toChartPoints(rows: any[]): OilPricePoint[] {
  return rows.map((r) => {
    const price = Number(String(r.OIL_PRICE ?? "").replace(/,/g, ""));
    return {
      dateLabel: String(r.DLVRY_DT ?? ""),
      OIL_PRICE: Number.isFinite(price) ? price : null,
    };
  });
}

export function useOilPriceByGasStationController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // 선택 주유소의 평균유가 — sub01 그리드 + 차트 동시 갱신 (서버 동일 endpoint)
  const loadAvgOilPrice = useCallback(
    async (row: any) => {
      if (!row?.OPINET_GSSTTN_CD) {
        base.resetGrids(["sub01"]);
        model.setChartData([]);
        return;
      }
      const filters = model.filtersRef.current ?? {};
      const res: any = await api.getAvgOilPrice({
        ...filters,
        OPINET_GSSTTN_CD: row.OPINET_GSSTTN_CD,
      });
      const rows = extractRows(res);
      model.grids.sub01.setData({ rows, totalCount: rows.length } as any);
      model.setChartData(toChartPoints(rows));
    },
    [base, model],
  );

  const onMainGridClick = useCallback(
    (row: any) => {
      base.handleRowClick("main", row);
      void loadAvgOilPrice(row);
    },
    [base, loadAvgOilPrice],
  );

  // 조회 콜백 — 메인 set 후 첫 행 자동 선택 + 평균유가/차트 로드
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      const firstRow = data?.rows?.[0] ?? null;
      if (firstRow) {
        onMainGridClick(firstRow);
      } else {
        base.resetGrids(["sub01"]);
        model.setChartData([]);
      }
    },
    [base, model, onMainGridClick],
  );

  // 저장 (상표/사용여부)
  const onSaveMain = useCallback(
    () => base.saveGrid("main", api.saveMain, { afterSave: "refresh" }),
    [base],
  );

  // 오피넷 검색 및 등록 팝업
  const onOpnRegi = useCallback(() => {
    openPopup({
      title: "BTN_SEARCH_OPINET_AND_REGISTRY",
      width: "3xl",
      content: (
        <OpinetGasPop
          onConfirm={({ OPINET_GSSTTN_CD }) => {
            closePopup();
            void base
              .callAjax(
                api.registerGasStation({ OPINET_GSSTTN_CD, FLAG: "I" }),
                { mask: "main" },
              )
              .then(() => base.search());
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, openPopup]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_SEARCH_OPINET_AND_REGISTRY",
        label: "BTN_SEARCH_OPINET_AND_REGISTRY",
        onClick: onOpnRegi,
      },
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [menuName, model.grids.main, model.filtersRef, onOpnRegi, onSaveMain],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => {
          const sel = model.grids.main.selectedRef.current;
          if (!sel?.OPINET_GSSTTN_CD) return EMPTY_RESULT;
          return api.getAvgOilPrice({
            ...(model.filtersRef.current ?? {}),
            OPINET_GSSTTN_CD: sel.OPINET_GSSTTN_CD,
          });
        },
        rows: () => model.grids.sub01.rows,
      }),
    ],
    [menuName, model.grids.sub01, model.grids.main, model.filtersRef],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    sub01Actions,
  };
}
