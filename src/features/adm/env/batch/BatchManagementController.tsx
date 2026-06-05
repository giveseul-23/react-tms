import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { usePopup } from "@/app/components/popup/PopupContext";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";
import {
  makeAddAction,
  makeExcelGroupAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { Lang } from "@/app/services/common/Lang";
import { batchManagementApi } from "./BatchManagementApi";
import type { BatchManagementModel, GridKey } from "./BatchManagementModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: BatchManagementModel;
}

const MENU_CD = "MENU_BACH_MGMT";
const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

const MINUTE_SECOND_SINGLE = /^(5[0-9]|4[0-9]|3[0-9]|2[0-9]|1[0-9]|0[0-9]|[0-9]{1})$/;
const MINUTE_SECOND_PAIR = /(5[0-9]|4[0-9]|3[0-9]|2[0-9]|1[0-9]|0[0-9]|^[0-9]{1})\/(5[0-9]|4[0-9]|3[0-9]|2[0-9]|1[0-9]|0[0-9]|[0-9]{1}$)/;
const HOUR_SINGLE = /^(2[0-3]|1[0-9]|0[0-9]|[0-9]{1})$/;
const HOUR_PAIR = /(2[0-3]|1[0-9]|0[0-9]|^[0-9]{1})\/(2[0-3]|1[0-9]|0[0-9]|[0-9]{1}$)/;

export function useBatchManagementController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();
  const selectedMain = model.grids.main.selected;
  const sub01ActionDisabled =
    !selectedMain || String(selectedMain?.EDIT_STS ?? "").trim() === "I";

  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      batchManagementApi.getBatchManagementList(MENU_CD, params),
    [],
  );

  const fetchSub01 = useCallback(
    (row: any) =>
      batchManagementApi.getBatchTriggerList(MENU_CD, {
        JOB_ID: row.JOB_ID,
      }),
    [],
  );

  const fetchSub02 = useCallback(
    (row: any) =>
      batchManagementApi.getBatchHistoryList(MENU_CD, {
        JOB_ID: row.JOB_ID,
        TRGR_ID: row.TRGR_ID,
      }),
    [],
  );

  const loadSub02 = useCallback(
    async (sub01Row: any) => {
      base.resetGrids(["sub02"]);
      if (!sub01Row || String(sub01Row.EDIT_STS ?? "").trim() === "I") return;
      const sub02Rows = await base.searchSub("sub02", fetchSub02(sub01Row));
      const firstSub02 =
        model.grids.sub02.ref.current?.rows?.[0] ?? sub02Rows?.[0] ?? null;

      model.grids.sub02.setSelected(firstSub02);
    },
    [base, fetchSub02, model.grids.sub02],
  );

  const loadSub01 = useCallback(
    async (mainRow: any) => {
      base.resetGrids(["sub01", "sub02"]);
      if (!mainRow || String(mainRow.EDIT_STS ?? "").trim() === "I") return;
      const sub01Rows = await base.searchSub("sub01", fetchSub01(mainRow));
      const firstSub01 =
        model.grids.sub01.ref.current?.rows?.[0] ?? sub01Rows?.[0] ?? null;

      if (firstSub01) {
        model.grids.sub01.setSelected(firstSub01);
        await loadSub02(firstSub01);
      }
    },
    [base, fetchSub01, loadSub02, model.grids.sub01],
  );

  const onMainGridClick = useCallback(
    async (row: any) => {
      model.grids.main.setSelected(row ?? null);
      await loadSub01(row);
    },
    [loadSub01, model.grids.main],
  );

  const onSub01GridClick = useCallback(
    async (row: any) => {
      model.grids.sub01.setSelected(row ?? null);
      await loadSub02(row);
    },
    [loadSub02, model.grids.sub01],
  );

  const onSearchCallback = useCallback(
    async (data: any) => {
      model.grids.main.setData(data);
      const firstMain =
        model.grids.main.ref.current?.rows?.[0] ?? data?.rows?.[0] ?? null;
      if (firstMain) {
        model.grids.main.setSelected(firstMain);
        await loadSub01(firstMain);
      } else {
        base.resetGrids(["sub01", "sub02"]);
      }
    },
    [base, loadSub01, model.grids.main],
  );

  const validateTriggerRows = useCallback(() => {
    const dirtyRows = model.grids.sub01.rows.filter((row: any) =>
      ["I", "U", "D"].includes(String(row.EDIT_STS ?? "")),
    );

    for (const row of dirtyRows) {
      const start = String(row.TRGR_STRT_DTTM ?? "").trim();
      const end = String(row.TRGR_END_DTTM ?? "").trim() || "99999999999999";
      if (start && end && start >= end) {
        base.alert(Lang.get("MSG_BTCH_DATE_RANGE_VALIDATION1"));
        return false;
      }

      const runType = String(row.JOB_RUN_TYP ?? "").trim();
      if (runType === "RTM_CCL") {
        for (const field of ["TRGR_MIN", "TRGR_SEC"]) {
          const value = String(row[field] ?? "").trim();
          if (value && !MINUTE_SECOND_SINGLE.test(value)) {
            base.alert(Lang.get("MSG_BTCH_RTM_CCL_VALIDATION"));
            return false;
          }
        }
        const hour = String(row.TRGR_HOUR ?? "").trim();
        if (hour && !HOUR_SINGLE.test(hour)) {
          base.alert(Lang.get("MSG_BTCH_RTM_CCL_VALIDATION"));
          return false;
        }
      }

      if (runType === "RPT_CCL") {
        for (const field of ["TRGR_MIN", "TRGR_SEC"]) {
          const value = String(row[field] ?? "").trim();
          if (value && !MINUTE_SECOND_PAIR.test(value)) {
            base.alert(Lang.get("MSG_BTCH_RPT_CCL_VALIDATION"));
            return false;
          }
        }
        const hour = String(row.TRGR_HOUR ?? "").trim();
        if (hour && !HOUR_PAIR.test(hour)) {
          base.alert(Lang.get("MSG_BTCH_RPT_CCL_VALIDATION"));
          return false;
        }
      }
    }

    return true;
  }, [base, model.grids.sub01.rows]);

  const onMainGridAdd = useCallback(() => {
    base.resetGrids(["sub01", "sub02"]);
    base.addRow("main", {
      JOB_NM: "",
      JOB_CLS: "",
      JOB_TYP: "",
      JOB_RUN_TYP: "",
      JOB_DESC: "",
      JOB_IN_VALS: "",
      JOB_USE_YN: "Y",
    });
  }, [base]);

  const onSubgrid01Add = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "Batch")) return;

    base.resetGrids(["sub02"]);
    base.addRow("sub01", {
      JOB_ID: main.JOB_ID,
      JOB_TYP: main.JOB_TYP,
      JOB_RUN_TYP: main.JOB_RUN_TYP,
      JOB_CLS: main.JOB_CLS,
      TRGR_USE_YN: "Y",
      TRGR_CCL_TYP: "S",
      TRGR_CCL: "0",
      TRGR_RPT_CNT: "0",
      TRGR_SEC: "0",
      TRGR_MIN: "0",
      TRGR_HOUR: "0",
      TRGR_DATE: "*",
      TRGR_MONTH: "*",
      TRGR_LAST_DAY: "N",
      TRGR_SUN: "N",
      TRGR_MON: "N",
      TRGR_TUE: "N",
      TRGR_WED: "N",
      TRGR_THU: "N",
      TRGR_FRI: "N",
      TRGR_SAT: "N",
    });
  }, [base, model.grids.main]);

  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", (payload) =>
        batchManagementApi.saveBatchManagement({
          ...payload,
          MENU_CD,
        }),
      ),
    [base],
  );

  const onSaveSub01 = useCallback(
    () =>
      base.saveGrid(
        "sub01",
        (payload) =>
          batchManagementApi.saveBatchTrigger({
            ...payload,
            MENU_CD,
          }),
        {
          beforeSave: validateTriggerRows,
          afterSave: {
            cascadeFrom: "main",
            fetch: (main) => fetchSub01(main),
          },
        },
      ),
    [base, fetchSub01, validateTriggerRows],
  );

  const onExeBatch = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main) return;

    base
      .callAjax(
        batchManagementApi.executeBatch({
          module: "TMS",
          MENU_CD,
          JOB_ID: main.JOB_ID,
          JOB_CLS: main.JOB_CLS,
        }),
        "MSG_SAVE_CMPLT",
      )
      .then(() => base.search());
  }, [base, model.grids.main]);

  const onSubGrid02DoubleClick = useCallback(
    (row: any) => {
      openPopup({
        title: "LBL_TRGR_RSLT",
        content: (
          <ConfirmModal
            title={Lang.get("LBL_TRGR_RSLT")}
            description={String(row?.TRGR_RSLT_MSG ?? "")}
            onClose={closePopup}
            type="check"
          />
        ),
        width: "xl",
      });
    },
    [closePopup, openPopup],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_BATCH_MANAGEMENT_ONE_SELECTED_MENUAL_RUN",
        label: "BTN_BATCH_MANAGEMENT_ONE_SELECTED_MENUAL_RUN",
        onClick: onExeBatch,
      },
      makeAddAction({ onClick: onMainGridAdd }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () =>
          batchManagementApi.getBatchManagementList(MENU_CD, model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [model.filtersRef, model.grids.main.rows, onExeBatch, onMainGridAdd, onSaveMain],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({
        onClick: onSubgrid01Add,
        disabled: sub01ActionDisabled,
      }),
      makeSaveAction({
        onClick: onSaveSub01,
        disabled: sub01ActionDisabled,
      }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CD,
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
      model.grids.main,
      model.grids.sub01.rows,
      onSaveSub01,
      onSubgrid01Add,
      sub01ActionDisabled,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onSub01GridClick,
    onSubGrid02DoubleClick,
    mainActions,
    sub01Actions,
  };
}
