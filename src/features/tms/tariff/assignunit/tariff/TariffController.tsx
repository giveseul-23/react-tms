import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
  makeExcelUploadAction,
  makeExcelTemplateDownloadAction,
} from "@/app/components/grid/actions/commonActions";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { Lang } from "@/app/services/common/Lang";
import { tariffApi as api } from "./TariffApi";
import { MENU_CODE, AUTH } from "./Tariff";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { TariffModel, GridKey } from "./TariffModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: TariffModel;
}

const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

export function useTariffController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  // ── 조회조건 raw 값 (SearchMeta 필드 id = 센차 comp 이름) ──────────
  const getSearch = useCallback(
    () => (model.rawFiltersRef.current ?? {}) as Record<string, any>,
    [model.rawFiltersRef],
  );

  // ── sub01/sub02 cascade fetch (신규 행이면 미조회) ────────────────
  const fetchSub01 = useCallback((mainRow: any) => {
    if (!mainRow?.TRF_CD || String(mainRow.EDIT_STS ?? "").trim() === "I") {
      return EMPTY_RESULT;
    }
    return api.getChargeInfoList({ TRF_CD: mainRow.TRF_CD });
  }, []);

  const fetchSub02 = useCallback((mainRow: any) => {
    if (!mainRow?.TRF_CD || String(mainRow.EDIT_STS ?? "").trim() === "I") {
      return EMPTY_RESULT;
    }
    return api.getVehicleTypeInfoList({ TRF_CD: mainRow.TRF_CD });
  }, []);

  // ── 메인 조회 ─────────────────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // 서버 onMainInfoCallback 은 첫 행 자동선택을 하지 않는다 → main 만 set + sub reset.
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      base.resetGrids(["sub01", "sub02"]);
    },
    [base, model.grids.main],
  );

  // ── 메인 클릭 → sub01/sub02 동시 cascade ──────────────────────────
  const onMainGridClick = useCallback(
    (row: any) => {
      void base.handleRowClick("main", row, [
        { to: "sub01", fetch: fetchSub01 },
        { to: "sub02", fetch: fetchSub02 },
      ]);
    },
    [base, fetchSub01, fetchSub02],
  );

  const onSub01GridClick = useCallback(
    (row: any) => base.handleRowClick("sub01", row),
    [base],
  );
  const onSub02GridClick = useCallback(
    (row: any) => base.handleRowClick("sub02", row),
    [base],
  );

  // ── 메인 행 추가 — 조회조건의 사업부/물류운영그룹 자동 채움 ────────
  const onAddMain = useCallback(() => {
    const s = getSearch();
    base.addRow("main", {
      DIV_CD: s.SRCH_TRF_DIV_CD ?? "",
      DIV_NM: s.SRCH_TRF_DIV_NM ?? "",
      LGST_GRP_CD: s.SRCH_TRF_LGST_GRP_CD ?? "",
      LGST_GRP_NM: s.SRCH_TRF_LGST_GRP_NM ?? "",
    });
  }, [base, getSearch]);

  // ── 메인 저장 ─────────────────────────────────────────────────────
  const onSaveMain = useCallback(
    () => base.saveGrid("main", api.save, { afterSave: "refresh" }),
    [base],
  );

  // ── sub01 저장 — 부모행 기준 재조회 ───────────────────────────────
  const onSaveSub01 = useCallback(
    () =>
      base.saveGrid("sub01", api.saveChargeInfo, {
        afterSave: { cascadeFrom: "main", fetch: fetchSub01 },
      }),
    [base, fetchSub01],
  );

  // ── sub02 저장 — 부모행 기준 재조회 ───────────────────────────────
  const onSaveSub02 = useCallback(
    () =>
      base.saveGrid("sub02", api.saveVehicleTypeInfo, {
        afterSave: { cascadeFrom: "main", fetch: fetchSub02 },
      }),
    [base, fetchSub02],
  );

  // ── 요율항목 추가 (CommonPopup 코드검색, 다건) ────────────────────
  const onAddCharge = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, Lang.get("LBL_TARIFF_CODE"))) return;

    openPopup({
      title: "LBL_RATE_ITEM_CD",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectTariffChgCodeNameH2"
          extraParams={{ param1: String(main.TRF_CD) }}
          rowSelection="multiple"
          onApply={(rows: any) => {
            closePopup();
            const picked: any[] = Array.isArray(rows) ? rows : [rows];
            const existing = new Set(
              model.grids.sub01.rows.map((r: any) => r.CHG_CD),
            );
            const newRows = picked
              .filter((p) => p?.CODE && !existing.has(p.CODE))
              .map((p) => ({
                TRF_CD: main.TRF_CD,
                CHG_CD: p.CODE,
                CHG_NM: p.NAME,
                CALC_RNK: 1,
                FNT_OPR: "+",
              }));
            if (newRows.length) base.addRow("sub01", newRows);
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, model.grids.main.selectedRef, model.grids.sub01, openPopup]);

  // ── 차량유형 추가 (CommonPopup 코드검색, 다건) ────────────────────
  const onAddVehicleType = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, Lang.get("LBL_TARIFF_CODE"))) return;

    openPopup({
      title: "LBL_VEHICLE_TYPE_CODE",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectVehTpList"
          rowSelection="multiple"
          onApply={(rows: any) => {
            closePopup();
            const picked: any[] = Array.isArray(rows) ? rows : [rows];
            const existing = new Set(
              model.grids.sub02.rows.map((r: any) => r.VEH_TP_CD),
            );
            const newRows = picked
              .filter((p) => p?.CODE && !existing.has(p.CODE))
              .map((p) => ({
                TRF_CD: main.TRF_CD,
                VEH_TP_CD: p.CODE,
                VEH_TP_NM: p.NAME,
              }));
            if (newRows.length) base.addRow("sub02", newRows);
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, model.grids.main.selectedRef, model.grids.sub02, openPopup]);

  // ── 요율 엑셀 다운로드 (선택 행 기준, 서버 2단계) ─────────────────
  const onDownloadTariffExcel = useCallback(
    ({ data }: { data: any[] }) => {
      const selected = data ?? [];
      if (!selected.length) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"));
        return;
      }
      void base
        .callAjax(
          api.downloadTariffPrepare(selected).then((res: any) => {
            if (res?.data?.success === false) {
              throw new Error(res.data?.msg ?? Lang.get("MSG_FAIL"));
            }
            return api.downloadTariff().then((blobRes: any) => {
              const url = URL.createObjectURL(
                new Blob([blobRes.data], {
                  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = `${menuName}.xlsx`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              return blobRes;
            });
          }),
        );
    },
    [base, menuName],
  );

  // ── 그리드별 액션 ─────────────────────────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      {
        type: "group",
        key: "BTN_EXCEL",
        label: "BTN_EXCEL",
        items: [
          ...(makeExcelGroupAction({
            excelColumns: () => model.grids.main.getExcelColumns(),
            menuCode: MENU_CODE,
            menuName,
            fetchFn: () => api.getList(model.filtersRef.current),
            rows: model.grids.main.rows,
          }).items ?? []),
          makeExcelUploadAction({
            menuCode: MENU_CODE,
            gridId: AUTH.grids.main,
            onUploaded: () => base.search(),
          }),
          {
            type: "button",
            key: "BTN_EXCEL_DOWNLOAD",
            label: "BTN_EXCEL_DOWNLOAD",
            onClick: onDownloadTariffExcel,
          },
          makeExcelTemplateDownloadAction({
            menuCode: MENU_CODE,
            gridId: AUTH.grids.main,
            fileName: menuName,
          }),
        ],
      },
    ],
    [base, menuName, model.filtersRef, model.grids.main, onAddMain, onDownloadTariffExcel, onSaveMain],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddCharge }),
      makeSaveAction({ onClick: onSaveSub01 }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main ? fetchSub01(main) : EMPTY_RESULT;
        },
        rows: model.grids.sub01.rows,
      }),
    ],
    [fetchSub01, menuName, model.grids.main.selectedRef, model.grids.sub01, onAddCharge, onSaveSub01],
  );

  const sub02Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddVehicleType }),
      makeSaveAction({ onClick: onSaveSub02 }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub02.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main ? fetchSub02(main) : EMPTY_RESULT;
        },
        rows: model.grids.sub02.rows,
      }),
    ],
    [fetchSub02, menuName, model.grids.main.selectedRef, model.grids.sub02, onAddVehicleType, onSaveSub02],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onSub01GridClick,
    onSub02GridClick,
    mainActions,
    sub01Actions,
    sub02Actions,
  };
}
