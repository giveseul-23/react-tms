import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import {
  makeAddAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { Lang } from "@/app/services/common/Lang";
import {
  ROW_STATUS,
  commitRowChanges,
  toDsSave,
} from "@/app/components/grid/gridUtils/rowStatus";
import { tmsUserAccountApi as api } from "./TmsUserAccountApi";
import type {
  GridKey,
  TmsUserAccountModel,
} from "./TmsUserAccountModel";
import TmsUserAccountPopup from "./popup/TmsUserAccountPopup";

interface Args {
  model: TmsUserAccountModel;
}

const emptyResult = () =>
  Promise.resolve({ data: { data: { dsOut: [] } } });

const withoutDuplicates = (
  currentRows: any[],
  selectedRows: any[],
  field: string,
) => {
  const existing = new Set(
    currentRows
      .filter((row) => row.EDIT_STS !== ROW_STATUS.DELETE)
      .map((row) => String(row[field] ?? "")),
  );
  return selectedRows.filter((row) => {
    const key = String(row[field] ?? row.CODE ?? "");
    if (!key || existing.has(key)) return false;
    existing.add(key);
    return true;
  });
};

export function useTmsUserAccountController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { openPopup, closePopup } = usePopup();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => {
      const raw = model.rawFiltersRef.current as Record<string, any>;
      return api.getList({
        ...params,
        LOC_CD: raw?.SRCH_LOC_LOC_CD ?? params.LOC_CD ?? "",
      });
    },
    [model.rawFiltersRef],
  );

  const fetchSub01 = useCallback(
    (row: any) =>
      row?.USR_ID
        ? api.getUserDivList({ USR_ID: row.USR_ID })
        : emptyResult(),
    [],
  );

  const fetchSub03 = useCallback(
    (row: any) =>
      row?.USR_ID
        ? api.getUserLocList({ USR_ID: row.USR_ID })
        : emptyResult(),
    [],
  );

  const fetchSub02 = useCallback(
    (row: any) =>
      row?.USR_ID && row?.DIV_CD
        ? api.getUserLgstGrpList({
            USR_ID: row.USR_ID,
            DIV_CD: row.DIV_CD,
          })
        : emptyResult(),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick(
        "main",
        row,
        [
          { to: "sub01", fetch: fetchSub01 },
          { to: "sub03", fetch: fetchSub03 },
        ],
        { alsoReset: ["sub02"] },
      ),
    [base, fetchSub01, fetchSub03],
  );

  const onSub01GridClick = useCallback(
    (row: any) =>
      base.handleRowClick("sub01", row, [
        { to: "sub02", fetch: fetchSub02 },
      ]),
    [base, fetchSub02],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const onMainCellValueChanged = useCallback(
    (params: any) => {
      if (params.colDef?.field !== "USR_TP") return;
      const patch =
        params.newValue === "USRCARRIER"
          ? { USR_CUST_CD: "", USR_CUST_NM: "" }
          : { USR_CARR_CD: "", USR_CARR_NM: "" };
      commitRowChanges(model.grids.main.setData, params.data, patch);
    },
    [model.grids.main],
  );

  const onAddMain = useCallback(() => {
    openPopup({
      title: "MENU_USER_ACCOUNT",
      width: "2xl",
      content: (
        <TmsUserAccountPopup
          onConfirm={(selectedRows) => {
            closePopup();
            const additions = withoutDuplicates(
              model.grids.main.rows,
              selectedRows,
              "USR_ID",
            ).map((row) => ({
              USR_ID: row.USR_ID,
              USR_NM: row.USR_NM,
              TEL_NO: row.TEL_NO,
              MBL_PHN_NO: row.MBL_PHN_NO,
              EMAIL_ADDR: row.EMAIL_ADDR,
              USE_STT_DT: row.USE_STT_DT,
              USE_END_DT: row.USE_END_DT,
              USE_YN: row.USE_YN,
              MBL_USE: row.MBL_USE ?? "N",
            }));
            if (additions.length > 0) {
              base.resetGrids(["sub01", "sub02", "sub03"]);
              base.addRow("main", additions);
            }
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, model.grids.main, openPopup]);

  const onAddSub01 = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, Lang.get("LBL_USER_ID"))) return;

    openPopup({
      title: "LBL_DIVISION",
      width: "2xl",
      content: (
        <CommonPopup
          rowSelection="multiple"
          sqlId="selectDivisionCodeNameNoAuth"
          extraParams={{ keyParam: String(main.CUST_GRP_CD ?? "") }}
          onApply={(selected: any) => {
            closePopup();
            const rows = Array.isArray(selected) ? selected : [selected];
            const additions = withoutDuplicates(
              model.grids.sub01.rows,
              rows,
              "DIV_CD",
            ).map((row) => ({
              USR_ID: main.USR_ID,
              DIV_CD: row.CODE,
              DIV_NM: row.NAME,
              DFT_YN: "N",
            }));
            if (additions.length > 0) base.addRow("sub01", additions);
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, model.grids.main, model.grids.sub01, openPopup]);

  const onAddSub02 = useCallback(() => {
    const division = model.grids.sub01.selectedRef.current;
    if (!base.requireParentRow(division, Lang.get("LBL_DIVISION_CODE"))) return;

    openPopup({
      title: "LBL_LOGISTICS_GROUP",
      width: "2xl",
      content: (
        <CommonPopup
          rowSelection="multiple"
          sqlId="selectLogisticsgroupCodeNameNoAuth"
          extraParams={{ keyParam: String(division.DIV_CD ?? "") }}
          onApply={(selected: any) => {
            closePopup();
            const rows = Array.isArray(selected) ? selected : [selected];
            const additions = withoutDuplicates(
              model.grids.sub02.rows,
              rows,
              "LGST_GRP_CD",
            ).map((row) => ({
              USR_ID: division.USR_ID,
              DIV_CD: division.DIV_CD,
              DIV_NM: division.DIV_NM,
              LGST_GRP_CD: row.CODE,
              LGST_GRP_NM: row.NAME,
              DFT_YN: "N",
            }));
            if (additions.length > 0) base.addRow("sub02", additions);
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, model.grids.sub01, model.grids.sub02, openPopup]);

  const onAddSub03 = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, Lang.get("LBL_USER_ID"))) return;

    openPopup({
      title: "LBL_USR_LOC",
      width: "2xl",
      content: (
        <CommonPopup
          rowSelection="multiple"
          sqlId="selectLocationCodeName"
          extraParams={{ keyParam: String(main.CUST_GRP_CD ?? "") }}
          onApply={(selected: any) => {
            closePopup();
            const rows = Array.isArray(selected) ? selected : [selected];
            const additions = withoutDuplicates(
              model.grids.sub03.rows,
              rows,
              "LOC_CD",
            ).map((row) => ({
              USR_ID: main.USR_ID,
              LOC_ID: row.LOC_ID,
              LOC_CD: row.CODE,
              LOC_NM: row.NAME,
            }));
            if (additions.length > 0) base.addRow("sub03", additions);
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, model.grids.main, model.grids.sub03, openPopup]);

  const validateMainBeforeSave = useCallback(() => {
    for (const row of model.grids.main.rows) {
      if (
        row.EDIT_STS !== ROW_STATUS.DELETE &&
        row.USR_TP === "USRCARRIER" &&
        !String(row.USR_CARR_CD ?? "").trim()
      ) {
        base.alert(Lang.get("MSG_CHK_USR_CARRIER"));
        return false;
      }
    }
    return true;
  }, [base, model.grids.main.rows]);

  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.save, {
        beforeSave: validateMainBeforeSave,
      }),
    [base, validateMainBeforeSave],
  );

  const onSaveSub01 = useCallback(
    () =>
      base.saveGrid("sub01", api.saveUserDiv, {
        afterSave: { cascadeFrom: "main", fetch: fetchSub01 },
      }),
    [base, fetchSub01],
  );

  const onSaveSub02 = useCallback(
    () =>
      base.saveGrid("sub02", api.saveUserLgstGrp, {
        afterSave: { cascadeFrom: "sub01", fetch: fetchSub02 },
      }),
    [base, fetchSub02],
  );

  const onSaveSub03 = useCallback(
    () =>
      base.saveGrid("sub03", api.saveUserLoc, {
        afterSave: { cascadeFrom: "main", fetch: fetchSub03 },
      }),
    [base, fetchSub03],
  );

  const onInitPasswd = useCallback(async () => {
    const selected = model.grids.main.selectedRef.current;
    if (!selected) {
      base.alert(Lang.get("MSG_CHK_SELECT_USR"));
      return;
    }
    if (selected.USR_TP === "USREPLOYEE") {
      base.alert(Lang.get("MSG_ERR_EMPLOYEE"));
      return;
    }
    await base.callAjax(
      api.initPasswd({
        dsSave: toDsSave([
          { ...selected, EDIT_STS: ROW_STATUS.UPDATE },
        ]),
      }),
      { mask: "main" },
    );
  }, [base, model.grids.main.selectedRef]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_INIT_PASSWD",
        label: "BTN_INIT_PASSWD",
        onClick: onInitPasswd,
      },
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
    ],
    [onAddMain, onInitPasswd, onSaveMain],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddSub01 }),
      makeSaveAction({ onClick: onSaveSub01 }),
    ],
    [onAddSub01, onSaveSub01],
  );

  const sub02Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddSub02 }),
      makeSaveAction({ onClick: onSaveSub02 }),
    ],
    [onAddSub02, onSaveSub02],
  );

  const sub03Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddSub03 }),
      makeSaveAction({ onClick: onSaveSub03 }),
    ],
    [onAddSub03, onSaveSub03],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onSub01GridClick,
    onMainCellValueChanged,
    mainActions,
    sub01Actions,
    sub02Actions,
    sub03Actions,
  };
}
