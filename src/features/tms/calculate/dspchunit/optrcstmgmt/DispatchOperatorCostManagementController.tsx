/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { dispatchOperatorCostApi as api } from "./DispatchOperatorCostManagementApi";
import { MENU_CODE } from "./DispatchOperatorCostManagement";
import {
  makeExcelGroupAction,
  makeSaveAction,
  makeMemoGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import {
  commitRowChanges,
  toDsSave,
} from "@/app/components/grid/gridUtils/rowStatus";
import { AP_FI_STS } from "@/app/components/grid/status/statusEnums";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  DispatchOperatorCostModel,
  GridKey,
} from "./DispatchOperatorCostManagementModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { Lang } from "@/app/services/common/Lang";

const masterParam = (row: any) => ({
  DSPCH_NO: row?.DSPCH_NO,
  AP_ID: row?.AP_ID,
  DEFAULT_TYPE: row?.DEFAULT_TYPE,
});

interface Args {
  model: DispatchOperatorCostModel;
}

export function useDispatchOperatorCostController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // master 클릭 → costDetail/waypoint/evidence cascade + costFunction reset
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick(
        "main",
        row,
        [
          {
            to: "costDetail",
            fetch: (r) => api.getCostDetailList(masterParam(r)),
          },
          {
            to: "waypoint",
            fetch: (r) => api.getWaypointList(masterParam(r)),
          },
          {
            to: "evidence",
            fetch: (r) => api.getEvidenceList(masterParam(r)),
          },
        ],
        { alsoReset: ["costFunction"] },
      ),
    [base],
  );

  // costDetail 행 클릭 → costFunction cascade
  const onCostDetailRowClicked = useCallback(
    (row: any) =>
      base.handleRowClick("costDetail", row, [
        {
          to: "costFunction",
          fetch: (r) =>
            api.getCostFunctionList({
              DSPCH_NO: r.DSPCH_NO,
              CHG_CD: r.CHG_CD,
            }),
        },
      ]),
    [base],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const doAction = useCallback(
    (apiCall: () => Promise<any>, msg = "MSG_SAVE_CMPLT") =>
      base.callAjax(apiCall(), { successMsg: msg, mask: "main" }).then(() => base.search()),
    [base],
  );

  const getSelectedRows = useCallback(
    (e: any) => {
      const rows = (e?.data ?? []) as any[];
      if (rows.length === 0) {
        base.alert(
          Lang.get("MSG_SELECT_NO_DATA"),
          Lang.get("TTL_ALERT"),
        );
        return null;
      }
      return rows;
    },
    [base],
  );

  const toUpdateRows = useCallback(
    (rows: any[], patch: Record<string, any> = {}) =>
      rows.map((row) => ({ ...row, ...patch, rowStatus: "U" })),
    [],
  );

  const validateOpenRows = useCallback(
    (rows: any[], defaultOnly = false) => {
      if (rows.some((row) => String(row.AP_FI_STS ?? "") !== AP_FI_STS.OPEN)) {
        base.alert(
          Lang.get("MSG_REMAKE_APPLAN_CAN_VALID"),
          Lang.get("TTL_ALERT"),
        );
        return false;
      }
      if (defaultOnly && rows.some((row) => row.DEFAULT_TYPE !== "DEF")) {
        base.alert(
          Lang.get("MSG_CHK_ADDAP_RATING"),
          Lang.get("TTL_ALERT"),
        );
        return false;
      }
      return true;
    },
    [base],
  );

  const refetchSubTabs = useCallback(() => {
    const row = model.grids.main.selectedRef.current;
    if (row) onMainGridClick(row);
  }, [model.grids.main, onMainGridClick]);

  const refetchEvidenceAfterUpload = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main) return;
    const params = masterParam(main);
    void base.searchSub("costDetail", api.getCostDetailList(params));
    void base.searchSub("evidence", api.getEvidenceList(params));
  }, [base, model.grids.main]);

  const onCalculateCost = useCallback(
    (e: any) => {
      const selected = getSelectedRows(e);
      if (!selected || !validateOpenRows(selected, true)) return;
      const rows = toUpdateRows(selected);
      const first = rows[0];
      const last = rows[rows.length - 1];
      doAction(() =>
        api.calculateCost(rows, {
          DIV_CD: first.DIV_CD,
          LGST_GRP_CD: first.LGST_GRP_CD,
          PAY_LGST_GRP_CD: first.LGST_GRP_CD,
          DLVRY_DT_FROM: first.DLVRY_DT,
          DLVRY_DT_TO: last.DLVRY_DT,
        }),
      );
    },
    [doAction, getSelectedRows, toUpdateRows, validateOpenRows],
  );

  const onRecalculateDistance = useCallback(
    (e: any) => {
      const selected = getSelectedRows(e);
      if (!selected) return;
      const rows = toUpdateRows(
        selected.map((row) => ({
          ...row,
          DLVRY_DT: String(row.DLVRY_DT ?? "")
            .split(" ")[0]
            .replace(/-/g, ""),
        })),
      );
      doAction(() => api.recalculateMoveDistance(rows));
    },
    [doAction, getSelectedRows, toUpdateRows],
  );

  const onDailySettlement = useCallback(
    (e: any, cancel = false) => {
      const selected = getSelectedRows(e);
      if (!selected) return;
      const invalid = cancel
        ? selected.some(
            (row) =>
              String(row.DLY_SETL_STS ?? "") < "15" ||
              String(row.AP_FI_STS ?? "") === AP_FI_STS.CANCEL,
          )
        : selected.some((row) => String(row.DLY_SETL_STS ?? "") !== "10");
      if (invalid) {
        base.alert(
          Lang.get(
            cancel
              ? "MSG_CHECK_DLY_SETL_STS_CMPLT"
              : "MSG_CHECK_DLY_SETL_STS_NEW",
          ),
          Lang.get("TTL_ALERT"),
        );
        return;
      }
      const rows = toDsSave(
        toUpdateRows(selected).map((row) => ({
          ...row,
          MENU_CD: MENU_CODE,
        })),
      );
      doAction(() =>
        cancel
          ? api.cancelCloseDaily({ dsSave: rows })
          : api.closeDaily({ dsSave: rows }),
      );
    },
    [base, doAction, getSelectedRows, toUpdateRows],
  );

  const onConfirmCost = useCallback(
    (e: any, cancel = false) => {
      const selected = getSelectedRows(e);
      if (!selected) return;
      const rows = toUpdateRows(selected);
      doAction(() =>
        cancel ? api.cancelConfirmCost(rows) : api.confirmCost(rows),
      );
    },
    [doAction, getSelectedRows, toUpdateRows],
  );

  const onDeleteSettlement = useCallback(
    (e: any) => {
      const selected = getSelectedRows(e);
      if (!selected || !validateOpenRows(selected)) return;
      doAction(() => api.deleteSettlement(toUpdateRows(selected)));
    },
    [doAction, getSelectedRows, toUpdateRows, validateOpenRows],
  );

  const onCostFunctionChanged = useCallback(
    (params: any) => {
      if (params?.colDef?.field !== "ADJ_CLSS_CD_VAL") return;
      const row = params.data;
      const leftRow = model.grids.costDetail.selectedRef.current;
      if (!row || !leftRow) return;

      const value = Number(row.ADJ_CLSS_CD_VAL || row.CLSS_CD_VAL || 0);
      const rate = Number(row.ADJ_RT || 0);
      const cost = Number(row.COST || 0);
      const calculated =
        row.OPR === "/"
          ? value / rate
          : row.OPR === "*"
            ? value * rate
            : row.OPR === "+"
              ? value + rate
              : row.OPR === "-"
                ? value - rate
                : 0;
      const adjustedCost = Math.floor(calculated * cost * 100) / 100;

      commitRowChanges(
        model.grids.costFunction.setData,
        row,
        { ADJ_CALC_COST: adjustedCost },
      );
      const total = model.grids.costFunction.rows.reduce(
        (sum: number, item: any) =>
          sum +
          Number(
            item.__rid__ === row.__rid__
              ? adjustedCost
              : item.ADJ_CALC_COST ?? 0,
          ),
        0,
      );
      commitRowChanges(
        model.grids.costDetail.setData,
        leftRow,
        { ADJ_COST: total },
      );
    },
    [model.grids.costDetail, model.grids.costFunction],
  );

  const onCostDetailChanged = useCallback(
    (params: any) => {
      const field = params?.colDef?.field;
      if (!field || !params?.data) return;
      const target = params.data;
      const updateRow = (row: any) => {
        const isTarget =
          row === target ||
          (!!row?.__rid__ && row.__rid__ === target.__rid__);
        if (!isTarget) return row;
        return {
          ...row,
          [field]: params.newValue,
          EDIT_STS: row.EDIT_STS === "I" ? "I" : "U",
        };
      };
      model.grids.costDetail.setData((prev: any) =>
        Array.isArray(prev)
          ? prev.map(updateRow)
          : { ...prev, rows: (prev?.rows ?? []).map(updateRow) },
      );
    },
    [model.grids.costDetail],
  );

  const onSaveCostDetail = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main || !validateOpenRows([main])) return;
    const detailRows = dirtyRows(model.grids.costDetail.rows);
    const functionRows = dirtyRows(model.grids.costFunction.rows);
    if (detailRows.length === 0 && functionRows.length === 0) {
      base.alert(
        Lang.get("MSG_NO_DATA_TO_SAVE"),
        Lang.get("TTL_ALERT"),
      );
      return;
    }
    const invalid = detailRows.some((row: any) => {
      const hasCost = row.ADJ_COST !== "" && row.ADJ_COST != null;
      const hasReason = String(row.ADJ_RSN ?? "").trim() !== "";
      return (hasCost &&
          !hasReason &&
          Number(row.INS_COST) !== Number(row.ADJ_COST)) ||
        (!hasCost && hasReason);
    });
    if (invalid) {
      base.alert(
        Lang.get("MSG_CHK_RSN_NULL"),
        Lang.get("TTL_ALERT"),
      );
      return;
    }
    base
      .callAjax(
        api.saveDetail({
          FI_APPLN_DTL: JSON.stringify(toDsSave(detailRows)),
          FI_DSPCH_APPLN_RT: JSON.stringify(toDsSave(functionRows)),
        }),
        { mask: ["costDetail", "costFunction"] },
      )
      .then(() => {
        refetchSubTabs();
        base.search();
      });
  }, [
    base,
    model.grids.costDetail,
    model.grids.costFunction,
    model.grids.main,
    refetchSubTabs,
    validateOpenRows,
  ]);

  const onUploadEvidence = useCallback(() => {
    const detail = model.grids.costDetail.selectedRef.current;
    if (!detail) {
      base.alert(
        Lang.get("MSG_SELECT_NO_DATA"),
        Lang.get("TTL_ALERT"),
      );
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,application/pdf";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        base.alert(
          Lang.get("MSG_FILE_ONLY_PDF"),
          Lang.get("TTL_ALERT"),
        );
        return;
      }
      void base
        .callAjax(
          api.uploadEvidence(file, {
            DSPCH_APPLN_DTL_ID: detail.DSPCH_APPLN_DTL_ID,
            FILE_JOB_TP: detail.FILE_JOB_TP,
            FILE_OP_TCD: "40",
          }),
          { mask: "costDetail" },
        )
        .then(refetchEvidenceAfterUpload);
    };
    input.click();
  }, [base, model.grids.costDetail, refetchEvidenceAfterUpload]);

  const onDownloadEvidence = useCallback(
    async (e: any) => {
      const selected = getSelectedRows(e);
      if (!selected) return;

      const zipFlag = selected.length > 1 ? "Y" : "N";
      const fileIds = selected.map((row) => row.FILE_ID).join(",");
      const main = model.grids.main.selectedRef.current;
      const fallbackName =
        zipFlag === "Y"
          ? `${main?.LGST_GRP_NM ?? ""}_${main?.AP_ID ?? ""}_${main?.DLVRY_DT ?? ""}.zip`
          : `${selected[0].ORG_FILE_NM ?? ""}${selected[0].FILE_NM_EXTENSION ?? ""}`;

      try {
        const res = await api.downloadEvidence(fileIds, zipFlag);
        const url = URL.createObjectURL(new Blob([res.data as BlobPart]));
        const link = document.createElement("a");
        link.href = url;
        link.download = fallbackName || "download";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        base.alert(
          Lang.get("MSG_FILE_DOWNLOAD_CMPLT"),
          Lang.get("TTL_CONFIRM"),
        );
        refetchSubTabs();
      } catch {
        base.alert(
          Lang.get("MSG_ERR_FILE_DOWNLOAD"),
          Lang.get("TTL_ERR"),
        );
      }
    },
    [base, getSelectedRows, model.grids.main, refetchSubTabs],
  );

  const onRestoreRoute = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main || !validateOpenRows([main])) return;
    base.confirm(
      Lang.get("MSG_DEL_FI_STOP_CHK"),
      () =>
        doAction(() =>
          api.restoreRoute(toUpdateRows([main])),
        ),
      Lang.get("TTL_CONFIRM"),
    );
  }, [base, doAction, model.grids.main, toUpdateRows, validateOpenRows]);

  const onMoveRoute = useCallback(
    (offset: -1 | 1) => {
      const main = model.grids.main.selectedRef.current;
      const selected = model.grids.waypoint.selectedRef.current;
      const rows = [...model.grids.waypoint.rows].sort(
        (a: any, b: any) => Number(a.STOP_SEQ) - Number(b.STOP_SEQ),
      );
      if (!main || !selected || !validateOpenRows([main])) return;
      const index = rows.findIndex(
        (row: any) => row.__rid__ === selected.__rid__,
      );
      const targetIndex = index + offset;
      if (index < 0 || targetIndex < 0 || targetIndex >= rows.length) return;
      rows[index] = {
        ...rows[index],
        STOP_SEQ: Number(rows[index].STOP_SEQ) + offset,
        NEW_ROUTE: true,
      };
      doAction(() =>
        api.saveFiRoute(
          toUpdateRows(
            rows.map((row: any) => ({
              ...row,
              DSPCH_NO: main.DSPCH_NO,
              PRIO_SEQ: rows[index].STOP_SEQ,
              adjVal: offset,
            })),
          ),
        ),
      );
    },
    [
      doAction,
      model.grids.main,
      model.grids.waypoint,
      toUpdateRows,
      validateOpenRows,
    ],
  );

  const onSaveWaypoint = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    const dirty = dirtyRows(model.grids.waypoint.rows);
    if (!main || !validateOpenRows([main])) return;
    if (dirty.length === 0) {
      base.alert(
        Lang.get("MSG_NO_DATA_TO_SAVE"),
        Lang.get("TTL_ALERT"),
      );
      return;
    }
    if (
      dirty.some(
        (row: any) =>
          (row.ADJ_DIRECT_DIST !== "" || row.ADJ_PRVS_DIST !== "") &&
          !String(row.ADJ_RSN ?? "").trim(),
      )
    ) {
      base.alert(
        Lang.get("MSG_REQ_ADJ_RSN"),
        Lang.get("TTL_ALERT"),
      );
      return;
    }
    const rows = toUpdateRows(model.grids.waypoint.rows);
    if (rows.length) rows[0].PRIO_SEQ = rows.length + 1;
    base
      .callAjax(api.saveFiRoute(rows), { mask: "waypoint" })
      .then(refetchSubTabs);
  }, [
    base,
    model.grids.main,
    model.grids.waypoint,
    refetchSubTabs,
    toUpdateRows,
    validateOpenRows,
  ]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_RATING",
        label: "BTN_RATING",
        onClick: onCalculateCost,
      },
      {
        type: "button",
        key: "BTN_RECALC_DISTANCE",
        label: "BTN_RECALC_DISTANCE",
        onClick: onRecalculateDistance,
      },
      {
        type: "dropdown",
        key: "BTN_DLY_SETL",
        label: "BTN_DLY_SETL",
        items: [
          {
            type: "button",
            key: "BTN_DLY_SETL",
            label: "BTN_DLY_SETL",
            onClick: (e: any) => onDailySettlement(e),
          },
          {
            type: "button",
            key: "BTN_DLY_SETL_CANCEL",
            label: "BTN_DLY_SETL_CANCEL",
            onClick: (e: any) => onDailySettlement(e, true),
          },
        ],
      },
      {
        type: "dropdown",
        key: "BTN_CONFIRM_COST",
        label: "BTN_CONFIRM_COST",
        items: [
          {
            type: "button",
            key: "BTN_CONFIRM_COST",
            label: "BTN_CONFIRM_COST",
            onClick: (e: any) => onConfirmCost(e),
          },
          {
            type: "button",
            key: "BTN_CANCEL_CONFIRM_COST",
            label: "BTN_CANCEL_CONFIRM_COST",
            onClick: (e: any) => onConfirmCost(e, true),
          },
        ],
      },
      {
        type: "button",
        key: "BTN_DELETE_AP",
        label: "BTN_DELETE_AP",
        onClick: onDeleteSettlement,
      },
      makeSaveAction({
        onClick: () => {
          void base.saveGrid("main", api.save);
        },
      }),
      makeMemoGroupAction({
        saveMemo: (rows, text) => api.saveMemo(rows, text),
        cancelMemo: (rows) => api.cancelMemo(rows),
        onDone: () => base.search(),
      }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [
      base,
      menuName,
      model.filtersRef,
      model.grids.main,
      onCalculateCost,
      onConfirmCost,
      onDailySettlement,
      onDeleteSettlement,
      onRecalculateDistance,
    ],
  );

  const costDetailActions: ActionItem[] = useMemo(
    () => [
      makeSaveAction({
        onClick: onSaveCostDetail,
      }),
      {
        type: "button",
        key: "BTN_ATTACH_DOC",
        label: "BTN_ATTACH_DOC",
        onClick: onUploadEvidence,
      },
    ],
    [onSaveCostDetail, onUploadEvidence],
  );

  const waypointActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_ROLLBACK_FI_ROUTE",
        label: "BTN_ROLLBACK_FI_ROUTE",
        onClick: onRestoreRoute,
      },
      {
        type: "button",
        key: "BTN_ADJUST_STOP_SEQ_PLUS",
        label: "BTN_ADJUST_STOP_SEQ_PLUS",
        onClick: () => onMoveRoute(-1),
      },
      {
        type: "button",
        key: "BTN_ADJUST_STOP_SEQ_MINUS",
        label: "BTN_ADJUST_STOP_SEQ_MINUS",
        onClick: () => onMoveRoute(1),
      },
      makeSaveAction({
        onClick: onSaveWaypoint,
      }),
    ],
    [onMoveRoute, onRestoreRoute, onSaveWaypoint],
  );

  const evidenceActions: ActionItem[] = useMemo(
    () => [
      makeSaveAction({
        onClick: (e: any) => {
          const saveRows = toDsSave(e.data);
          if (saveRows.length === 0) return;
          base
            .callAjax(api.saveEvidence(saveRows), { mask: "evidence" })
            .then(() => refetchSubTabs());
        },
      }),
      {
        type: "button",
        key: "LBL_FILE_DOWNLOAD",
        label: "LBL_FILE_DOWNLOAD",
        onClick: (e: any) => void onDownloadEvidence(e),
      },
    ],
    [base, onDownloadEvidence, refetchSubTabs],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onCostDetailRowClicked,
    onCostDetailChanged,
    onCostFunctionChanged,
    mainActions,
    costDetailActions,
    waypointActions,
    evidenceActions,
  };
}
