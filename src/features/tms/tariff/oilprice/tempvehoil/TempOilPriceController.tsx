import { useCallback, MutableRefObject } from "react";
import { tempOilPriceApi } from "./TempOilPriceApi";
import { TempOilPriceModel } from "./TempOilPriceModel";
import {
  MASTER_COLUMN_DEFS,
  OIL_PRICE_COLUMN_DEFS,
  PERIOD_COLUMN_DEFS,
} from "./TempOilPriceColumns";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
  makeCommonActions,
} from "@/app/components/grid/commonActions";

type ControllerProps = {
  model: TempOilPriceModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
  activeTabRef: MutableRefObject<string>;
};

export function useTempOilPriceController({
  model,
  searchRef,
  filtersRef,
  activeTabRef,
}: ControllerProps) {
  // ── 조회 API: 활성 탭 기준으로 분기 ───────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => {
      if (activeTabRef.current === "PERIOD") {
        return tempOilPriceApi.getTempOilPriceByPeriod(params);
      }
      return tempOilPriceApi.getList(params);
    },
    [activeTabRef],
  );

  // ── 조회 완료 콜백 ───────────────────────────────────────────
  // 활성 탭에 해당하는 state 만 세팅
  const handleSearch = useCallback(
    (data: any) => {
      const gridData = {
        rows: data.rows ?? [],
        totalCount: data.totalCount ?? data.rows?.length ?? 0,
        page: data.page ?? 1,
        limit: data.limit ?? model.pageSize,
      };

      if (activeTabRef.current === "PERIOD") {
        model.setPeriodRowData(gridData);
        return;
      }

      // 기본: 유가등록 탭
      model.setMasterRowData(gridData);
      model.resetSubGrids();
      handleMasterRowClicked(data.rows?.[0]);
    },
    [model, activeTabRef],
  );

  // ── 탭 A 우측: 선택된 그룹의 유가 상세 fetch ──────────────────
  const fetchOilPriceList = useCallback((row: any) => {
    const lgstGrpCd = row?.LGST_GRP_CD;
    if (!lgstGrpCd) return Promise.resolve([]);
    return tempOilPriceApi
      .getTempOilPrice({ LGST_GRP_CD: lgstGrpCd })
      .then((res: any) => res.data.result ?? res.data.data?.dsOut ?? [])
      .catch((err) => {
        throw Error(err);
      });
  }, []);

  // ── 좌측 행 클릭 → 우측 재조회 ────────────────────────────────
  const handleMasterRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);

      fetchOilPriceList(row).then((rows: any) => {
        model.setOilPriceRowData({
          rows,
          totalCount: rows.length,
          page: 1,
          limit: model.pageSize,
        });
      });
    },
    [model],
  );

  // ── 탭 A 우측 액션: 추가 / 저장 / 엑셀 ────────────────────────
  const oilPriceActions = [
    makeAddAction({
      onClick: () => {
        if (!model.selectedHeaderRowRef.current) return;
        model.setOilPriceRowData((prev: any) => ({
          ...prev,
          rows: [
            ...prev.rows,
            {
              _isNew: true,
              LGST_GRP_CD: model.selectedHeaderRowRef.current.LGST_GRP_CD,
              LGST_GRP_NM: model.selectedHeaderRowRef.current.LGST_GRP_NM,
            },
          ],
        }));
      },
    }),
    makeSaveAction({
      onClick: (e: any) => {
        const saveRows = (e.data ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        tempOilPriceApi.save(saveRows).then(() => searchRef.current?.());
      },
    }),
    makeExcelGroupAction({
      columns: OIL_PRICE_COLUMN_DEFS,
      menuName: "용차유가관리",
      fetchFn: () => tempOilPriceApi.getTempOilPrice(filtersRef.current),
      rows: model.oilPriceRowData.rows,
    }),
  ];

  // ── 탭 A 좌측 액션: 없음 (단순 선택 목록) ─────────────────────
  const masterActions: any[] = [];

  // ── 탭 B 액션: 엑셀만 ─────────────────────────────────────────
  const periodActions = makeCommonActions({
    excel: {
      columns: PERIOD_COLUMN_DEFS,
      menuName: "용차유가 기간별조회",
      fetchFn: () =>
        tempOilPriceApi.getTempOilPriceByPeriod(filtersRef.current),
      rows: model.periodRowData.rows,
    },
  });

  return {
    fetchList,
    handleSearch,
    handleMasterRowClicked,
    masterActions,
    oilPriceActions,
    periodActions,
  };
}
