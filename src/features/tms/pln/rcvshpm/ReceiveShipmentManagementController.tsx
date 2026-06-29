import { useCallback, useMemo, useRef } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { usePopup } from "@/app/components/popup/PopupContext";
import { Lang } from "@/app/services/common/Lang";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { receiveShipmentManagementApi as api } from "./ReceiveShipmentManagementApi";
import { MENU_CODE } from "./ReceiveShipmentManagement";
import type { GridKey, ReceiveShipmentManagementModel } from "./ReceiveShipmentManagementModel";
import ReceiveShipmentManagementPop from "./popup/ReceiveShipmentManagementPop";
import ReceiveShipmentDetailAddPop from "./popup/ReceiveShipmentDetailAddPop";
import ShipmentTransferPop from "./popup/ShipmentTransferPop";
import { CommonPopup } from "@/app/components/popup/CommonPopup";

interface Args {
  model: ReceiveShipmentManagementModel;
}

const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

const toActionDsSave = (rows: any[]) =>
  rows.map(({ EDIT_STS, __rid__, ...row }) => ({
    ...row,
    rowStatus: row.rowStatus ?? EDIT_STS ?? "U",
  }));

const hasConsolidationClass = (row: any) =>
  String(row?.CSLD_CLSS_CD ?? row?.csld_clss_cd ?? "").trim() !== "";

export function useReceiveShipmentManagementController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();
  const selectedMainRowsRef = useRef<any[]>([]);

  const getSearchParams = useCallback(
    (params: Record<string, unknown> = {}) => ({
      ...params,
      PLN_ID: model.rawFiltersRef.current.SRCH_PLN_ID ?? "",
      PKG_TP: model.rawFiltersRef.current.SRCH_PKG_TP ?? "",
    }),
    [model.rawFiltersRef],
  );

  const fetchList = useCallback((params: Record<string, unknown>) => api.search(getSearchParams(params)), [getSearchParams]);

  const fetchSub01 = useCallback((row: any) => (row?.SHPM_ID ? api.searchDetail({ SHPM_ID: row.SHPM_ID }) : EMPTY_RESULT), []);

  const loadSub01 = useCallback(async (row: any) => {
    base.resetGrids(["sub01"]);
    if (!row) return;
    const subRows = await base.searchSub("sub01", fetchSub01(row));
    const first = model.grids.sub01.ref.current?.rows?.[0] ?? subRows?.[0];
    if (first) model.grids.sub01.setSelected(first);
  }, [base, fetchSub01, model.grids.sub01]);

  const onMainGridClick = useCallback((row: any) => { model.grids.main.setSelected(row ?? null); void loadSub01(row); }, [loadSub01, model.grids.main]);

  const onMainSelectionChanged = useCallback((rows: any[] | null) => {
    selectedMainRowsRef.current = rows ?? [];
    const first = rows?.[0] ?? null;
    model.grids.main.setSelected(first);
    void loadSub01(first);
  }, [loadSub01, model.grids.main]);

  const onSearchCallback = useCallback((data: any) => {
    model.grids.main.setData(data);
    const firstMain = model.grids.main.ref.current?.rows?.[0] ?? data?.rows?.[0] ?? null;
    selectedMainRowsRef.current = firstMain ? [firstMain] : [];
    if (firstMain) {
      model.grids.main.setSelected(firstMain);
      void loadSub01(firstMain);
    } else {
      base.resetGrids(["sub01"]);
    }
  }, [base, loadSub01, model.grids.main]);

  const saveMainRows = useCallback(async (rows: any[], apiFn: (payload: any) => Promise<any>) => {
    if (!rows.length) {
      base.alert(Lang.get("MSG_NO_SELECT_SHIPMENT"));
      return;
    }
    await base.callAjax(apiFn({ dsSave: toActionDsSave(rows) }), { mask: "main" });
    base.search();
  }, [base]);

  const openShipmentPop = useCallback((mode: "I" | "U", record?: any) => {
    openPopup({
      title: mode === "I" ? "LBL_SHIPMENT_INSERT_POP": "LBL_SHIPMENT_UPDATE_POP",
      width: "4xl",
      content: (
        <ReceiveShipmentManagementPop
          mode={mode}
          initialValues={mode === "I" ? { DIV_CD: model.rawFiltersRef.current.SRCH_SHPM_DIV_CD ?? "", LGST_GRP_CD: model.rawFiltersRef.current.SRCH_SHPM_LGST_GRP_CD ?? "" } : record}
          onSaved={() => { closePopup(); base.search(); }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, model.rawFiltersRef, openPopup]);

  const onShipmentIns = useCallback(() => {
    const division = model.rawFiltersRef.current.SRCH_SHPM_DIV_CD;
    const lgstGrp = model.rawFiltersRef.current.SRCH_SHPM_LGST_GRP_CD;
    if (!division || !lgstGrp) { base.alert(Lang.get("LBL_SHPM_SRCH_COND_CHK")); return; }
    openShipmentPop("I");
  }, [base, model.rawFiltersRef, openShipmentPop]);

  const onShipmentUpd = useCallback(() => {
    const rows = selectedMainRowsRef.current;
    if (rows.length !== 1) { base.alert(Lang.get("MSG_CHK_SELECT_CNT")); return; }
    const row = rows[0];
    if (row.SHPM_OP_STS === "1000") { base.alert(Lang.get("MSG_CAN_SHIPMENT_OPR_VALID")); return; }
    if (row.PLN_ID) { base.alert(Lang.get("MSG_SHIPMENT_UPDATE_CHECK")); return; }
    if (row.IF_RCV_TP === "10") { base.alert(Lang.get("MSG_INTERFACE_CHECK")); return; }
    openShipmentPop("U", row);
  }, [base, openShipmentPop]);

  const onShipmentCancel = useCallback(() => {
    const rows = selectedMainRowsRef.current;
    if (!rows.length) { base.alert(Lang.get("MSG_NO_SELECT_SHIPMENT")); return; }
    if (rows.some((row) => row.PLN_ID)) { base.alert(Lang.get("MSG_CHK_PLN_NULL")); return; }
    if (rows.some((row) => row.SHPM_OP_STS === "1000")) { base.alert(Lang.get("MSG_CAN_SHIPMENT_OPR_VALID")); return; }
    const saveCancel = () => void saveMainRows(rows, api.saveShipmentCancel);
    if (rows.some(hasConsolidationClass)) {
      base.confirm(Lang.get("MSG_ASK_SO_CONSOL_NOTICE_CANCEL_SHIPMENT"), saveCancel);
      return;
    }
    saveCancel();
  }, [base, saveMainRows]);

  const onSettingPlanId = useCallback(() => {
    const rows = selectedMainRowsRef.current;
    if (!rows.length) { base.alert(Lang.get("MSG_NO_SELECT_SHIPMENT")); return; }
    const one = rows[0];
    if (rows.some((row) => row.SHPM_OP_STS === "1000")) { base.alert(Lang.get("MSG_CAN_SHIPMENT_OPR_VALID")); return; }
    if (rows.some((row) => row.PLN_ID)) { base.alert(Lang.get("MSG_SHIPMENT_PLAN_CHECK")); return; }
    openPopup({
      title: Lang.get("LBL_PLAN_ID"),
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectUsrPlanCodeName"
          extraParams={{ keyParam: one?.LGST_GRP_CD ?? "", module: "TMS" }}
          onApply={(row: any) => {
            closePopup();
            const payload = rows.map((item) => ({ ...item, PLN_ID: row?.CODE ?? "", PLN_NM: row?.NAME ?? "", rowStatus: "U" }));
            void saveMainRows(payload, api.saveShipmentPlanId);
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, openPopup, saveMainRows]);

  const onPlanIdCancel = useCallback(() => {
    const rows = selectedMainRowsRef.current;
    if (!rows.length) { base.alert(Lang.get("MSG_NO_SELECT_SHIPMENT")); return; }
    if (rows.some((row) => !row.PLN_ID)) { base.alert(Lang.get("MSG_SHIPMENT_PLAN_CANCEL_CHECK")); return; }
    if (rows.some((row) => row.SHPM_OP_STS === "1000")) { base.alert(Lang.get("MSG_CAN_SHIPMENT_OPR_VALID")); return; }
    const payload = rows.map((item) => ({ ...item, PLN_ID: "", PLN_NM: "", rowStatus: "U" }));
    void saveMainRows(payload, api.saveShipmentPlanIdCancel);
  }, [base, saveMainRows]);

  const onShipmentTransfer = useCallback(() => {
    const rows = selectedMainRowsRef.current;
    if (!rows.length) { base.alert(Lang.get("MSG_ORDERTRANSFER_SHIPMENT_SELECT_CHK")); return; }
    if (rows.length > 1) { base.alert(Lang.get("MSG_CHK_SELECT_CNT")); return; }
    const row = rows[0];
    openPopup({
      title: "BTN_SHIPMENT_TRANSFER",
      width: "lg",
      content: (
        <ShipmentTransferPop
          record={row}
          onApply={(payload) => {
            closePopup();
            const transferPayload = rows.map((item) => ({ ...item, ...payload, rowStatus: "U" }));
            void saveMainRows(transferPayload, api.saveShipmentTransfer);
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, openPopup, saveMainRows]);

  const onBatchInsert = useCallback(() => {
    const srchObj = model.rawFiltersRef.current;
    const division = srchObj.SHPM_DIV_CD ?? srchObj.SRCH_SHPM_DIV_CD ?? "";
    const lgstGrp = srchObj.SHPM_LGST_GRP_CD ?? srchObj.SRCH_SHPM_LGST_GRP_CD ?? ""; 
    const delivDt = srchObj.SHPM_DLVRY_DT_TO?? srchObj.SRCH_SHPM_DLVRY_DT_TO ?? "";
    if (!division || !lgstGrp) { base.alert(Lang.get("LBL_SHPM_SRCH_COND_CHK")); return; }
    void base.callAjax(api.saveBatchCreation({ DIV_CD: division, LGST_GRP_CD: lgstGrp, DLVRY_DT: delivDt ?? "" }), { mask: "main" })
            .then(() => base.search()
    );
  }, [base, model.rawFiltersRef]);

  const onSaveSub01 = useCallback(() => base.saveGrid("sub01", (payload) => api.saveShipmentDetail(payload), { afterSave: { cascadeFrom: "main", fetch: (main) => fetchSub01(main) } }), [base, fetchSub01]);

  const onAddSub01 = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, Lang.get("LBL_SHIPMENT_NUMBER"))) return;
    openPopup({
      title: "BTN_ADD",
      width: "4xl",
      content: (
        <ReceiveShipmentDetailAddPop
          onApply={(row) => {
            closePopup();
            base.addRow("sub01", {
              SHPM_ID: main.SHPM_ID,
              CUST_CD: main.CUST_CD,
              ...row,
            });
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, model.grids.main, openPopup]);

  const mainActions: ActionItem[] = useMemo(() => [
    { type: "button", key: "BTN_CRT_ORD_BTC", label: "BTN_CRT_ORD_BTC", onClick: onBatchInsert },
    { type: "button", key: "BTN_SHIPMENT_INSERT", label: "BTN_SHIPMENT_INSERT", onClick: onShipmentIns },
    { type: "button", key: "BTN_SHIPMENT_UPDATE", label: "BTN_SHIPMENT_UPDATE", onClick: onShipmentUpd },
    { type: "button", key: "BTN_SHIPMENT_CANCEL", label: "BTN_SHIPMENT_CANCEL", onClick: onShipmentCancel },
    { type: "button", key: "BTN_SHIPMENT_PLAN", label: "BTN_SHIPMENT_PLAN", onClick: onSettingPlanId },
    { type: "button", key: "BTN_SHIPMENT_PLAN_CANCEL", label: "BTN_SHIPMENT_PLAN_CANCEL", onClick: onPlanIdCancel },
    { type: "button", key: "BTN_SHIPMENT_TRANSFER", label: "BTN_SHIPMENT_TRANSFER", onClick: onShipmentTransfer },
    makeExcelGroupAction({ excelColumns: () => model.grids.main.getExcelColumns(), menuCode: MENU_CODE, menuName, fetchFn: () => api.search(getSearchParams(model.filtersRef.current)), rows: () => model.grids.main.rows }),
  ], [getSearchParams, menuName, model.filtersRef, model.grids.main, onBatchInsert, onPlanIdCancel, onSettingPlanId, onShipmentCancel, onShipmentIns, onShipmentTransfer, onShipmentUpd]);

  const sub01Actions: ActionItem[] = useMemo(() => [
    { type: "button", key: "BTN_ADD", label: "BTN_ADD", onClick: onAddSub01 },
    { type: "button", key: "BTN_SAVE", label: "BTN_SAVE", onClick: onSaveSub01 },
    makeExcelGroupAction({ excelColumns: () => model.grids.sub01.getExcelColumns(), menuCode: MENU_CODE, menuName, fetchFn: () => { const main = model.grids.main.selectedRef.current; return main ? fetchSub01(main) : EMPTY_RESULT; }, rows: () => model.grids.sub01.rows }),
  ], [fetchSub01, menuName, model.grids.main, model.grids.sub01, onAddSub01, onSaveSub01]);

  return { fetchList, onSearchCallback, onMainGridClick, onMainSelectionChanged, mainActions, sub01Actions };
}
