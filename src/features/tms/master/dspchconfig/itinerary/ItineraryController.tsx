import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { usePopup } from "@/app/components/popup/PopupContext";
import { ROW_STATUS } from "@/app/components/grid/gridCommon";
import { dirtyRows, toDsSave } from "@/app/components/grid/gridUtils/rowStatus";
import { Lang } from "@/app/services/common/Lang";
import { itineraryApi as api } from "./ItineraryApi";
import { ItineraryGroupPop } from "./popup/ItineraryGroupPop";
import { ItineraryAddStopPop } from "./popup/ItineraryAddStopPop";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { GridKey, ItineraryModel } from "./ItineraryModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { MENU_CODE } from "./Itinerary";

const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

interface ControllerArgs {
  model: ItineraryModel;
}

function srchLgstGrpCd(raw: Record<string, string>): string {
  return String(
    raw.SRCH_ITNR_LGST_GRP_CD ??
    raw.SRCH_TI_LGST_GRP_CD ??
    raw.LGST_GRP_CD ??
    "",
  ).trim();
}

function srchDivCd(raw: Record<string, string>): string {
  return String(
    raw.SRCH_ITNR_DIV_CD ?? raw.SRCH_TI_DIV_CD ?? raw.DIV_CD ?? "",
  ).trim();
}

function validateStopDirtyRows(
  dirty: any[],
  alert: (msg: string) => void,
): boolean {
  if (!dirty.length) {
    alert("변경된 데이터가 없습니다.");
    return false;
  }
  for (const row of dirty) {
    if (Number(row.STOP_SEQ) < 2) {
      alert(Lang.get("MSG_VALID_NUM_MIN", Lang.get("LBL_SEQ"), "2"));
      return false;
    }
  }
  const seqs = dirty
    .filter((r) => r.EDIT_STS !== ROW_STATUS.DELETE)
    .map((r) => Number(r.STOP_SEQ));
  if (seqs.length !== new Set(seqs).size) {
    alert(Lang.get("MSG_DUP_STOP_SEQ"));
    return false;
  }
  return true;
}

export function useItineraryController({ model }: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();
  const { resetGrids, searchSub, requireParentRow } = base;

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const fetchSub01 = useCallback((mainRow: any) => {
    if (!mainRow?.ITNR_ID || String(mainRow.EDIT_STS ?? "").trim() === "I") {
      return EMPTY_RESULT;
    }
    return api.getDetailList({ ITNR_ID: mainRow.ITNR_ID });
  }, []);

  const onMainGridClick = useCallback(
    (row: any) => {
      void base.handleRowClick("main", row, [
        { to: "sub01", fetch: fetchSub01 },
      ]);
    },
    [base, fetchSub01],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      const firstMain = data?.rows?.[0] ?? null;
      if (firstMain) {
        onMainGridClick(firstMain);
      } else {
        resetGrids(["sub01"]);
      }
    },
    [model.grids.main, onMainGridClick, resetGrids],
  );

  const onAddMain = useCallback(() => {
    const srch = model.rawFiltersRef.current ?? {};
    const lgstGrpCd = srchLgstGrpCd(srch);
    if (!lgstGrpCd) {
      base.alert(Lang.get("MSG_LOGISTICSGROUP_SELECT_CHK"));
      return;
    }
    base.addRow("main", {
      LGST_GRP_CD: lgstGrpCd,
      DIV_CD: srchDivCd(srch),
      USE_YN: "Y",
    });
  }, [base, model.rawFiltersRef]);

  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.save, {
        afterSave: "refresh",
      }),
    [base],
  );

  const onSetItineraryGroup = useCallback(
    ({ data }: { data: any[] }) => {
      const selected = data ?? [];
      if (!selected.length) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"));
        return;
      }
      if (selected.some((r) => String(r.EDIT_STS ?? "") === ROW_STATUS.INSERT)) {
        base.alert(Lang.get("MSG_CHECK_SET_ITNR_GROUP"));
        return;
      }

      const lgstGrpCd =
        srchLgstGrpCd(model.rawFiltersRef.current ?? {}) ||
        String(selected[0]?.LGST_GRP_CD ?? "");

      openPopup({
        title: "BTN_SET_ITNR_GROUP",
        width: "2xl",
        content: (
          <ItineraryGroupPop
            lgstGrpCd={lgstGrpCd}
            onApply={(itnrGrpCd) => {
              closePopup();
              const dsSave = toDsSave(
                selected.map((row) => ({
                  ...row,
                  ITNR_GRP_CD: itnrGrpCd,
                  EDIT_STS: ROW_STATUS.UPDATE,
                })),
              );
              void base
                .callAjax(api.setItineraryGroup({ dsSave }))
                .then(() => base.search());
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, closePopup, model.rawFiltersRef, openPopup],
  );

  const onClearItineraryGroup = useCallback(
    ({ data }: { data: any[] }) => {
      const selected = data ?? [];
      if (!selected.length) return;

      const dsSave = toDsSave(
        selected.map((row) => ({
          ...row,
          CLEAR_FLAG: "Y",
          EDIT_STS: ROW_STATUS.UPDATE,
        })),
      );
      void base
        .callAjax(api.setItineraryGroup({ dsSave }))
        .then(() => base.search());
    },
    [base],
  );

  const onAddStopPopup = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (
      !requireParentRow(main, Lang.get("LBL_ITINERARY_CODE"), {
        notSelectedMsg: Lang.get("MSG_ITINERARY_CODE"),
        notSavedMsg: Lang.get("MSG_SAVE_BEFORE_ADD"),
      })
    ) {
      return;
    }

    openPopup({
      title: "BTN_ADD_AND_ADJ_SEQ",
      width: "full",
      content: (
        <ItineraryAddStopPop
          itnrId={String(main.ITNR_ID)}
          frmLocId={String(main.LOC_ID ?? "")}
          divCd={String(main.DIV_CD ?? "")}
          onApply={(rows) => {
            const dirty = dirtyRows(rows);
            if (!validateStopDirtyRows(dirty, base.alert)) return;

            closePopup();
            void base
              .callAjax(api.saveDetail({ dsSave: toDsSave(dirty) }))
              .then(() => searchSub("sub01", fetchSub01(main)));
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [
    base,
    closePopup,
    fetchSub01,
    model.grids.main.selectedRef,
    openPopup,
    requireParentRow,
    searchSub,
  ]);

  const onSaveSub01 = useCallback(
    () =>
      base.saveGrid("sub01", api.saveDetail, {
        afterSave: {
          cascadeFrom: "main",
          fetch: fetchSub01,
        },
      }),
    [base, fetchSub01],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_SET_ITNR_GROUP",
        label: "BTN_SET_ITNR_GROUP",
        onClick: onSetItineraryGroup,
      },
      {
        type: "button",
        key: "BTN_CLEAR_ITNR_GROUP",
        label: "BTN_CLEAR_ITNR_GROUP",
        onClick: onClearItineraryGroup,
      },
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
            menuName: menuName,
            fetchFn: () => api.getList(model.filtersRef.current),
            rows: model.grids.main.rows,
          }).items ?? []),
          {
            type: "button",
            key: "BTN_EXCEL_UP",
            label: "BTN_EXCEL_UP",
            onClick: () => { },
          },
          {
            type: "button",
            key: "BTN_EXCEL_TEMPLATE_DOWNLOAD",
            label: "BTN_EXCEL_TEMPLATE_DOWNLOAD",
            onClick: () => { },
          },
        ],
      },
    ],
    [
      model.filtersRef,
      model.grids.main.rows,
      onAddMain,
      onClearItineraryGroup,
      onSaveMain,
      onSetItineraryGroup,
    ],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_ADD_AND_ADJ_SEQ",
        label: "BTN_ADD_AND_ADJ_SEQ",
        onClick: onAddStopPopup,
      },
      makeSaveAction({ onClick: onSaveSub01 }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main ? fetchSub01(main) : EMPTY_RESULT;
        },
        rows: model.grids.sub01.rows,
      }),
    ],
    [
      fetchSub01,
      model.grids.main.selectedRef,
      model.grids.sub01.rows,
      onAddStopPopup,
      onSaveSub01,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    sub01Actions,
  };
}
