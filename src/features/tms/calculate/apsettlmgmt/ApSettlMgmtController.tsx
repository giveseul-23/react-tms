import { useCallback, MutableRefObject } from "react";
import { apSettlMgmtApi } from "./ApSettlMgmtApi";
import { ApSettlMgmtModel } from "./ApSettlMgmtModel";
import { MAIN_COLUMN_DEFS } from "./ApSettlMgmtColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";

type ControllerProps = {
  model: ApSettlMgmtModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useApSettlMgmtController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const fetchList = useCallback(
    (params: Record<string, unknown>) => apSettlMgmtApi.getList(params),
    [],
  );

  const fetchSubTabs = useCallback(
    (row: any) => {
      if (!row) return;
      const params = {
        AP_SETL_ID: row.AP_SETL_ID,
        LGST_GRP_CD: row.LGST_GRP_CD,
      };

      apSettlMgmtApi
        .getSummaryList(params)
        .then((res: any) =>
          model.setSummaryRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      apSettlMgmtApi
        .getMonthlyFareList(params)
        .then((res: any) =>
          model.setMonthlyFareRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      apSettlMgmtApi
        .getHireDispatchPayList(params)
        .then((res: any) =>
          model.setHireDispatchPayRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      apSettlMgmtApi
        .getFreightPayList(params)
        .then((res: any) =>
          model.setFreightPayRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      apSettlMgmtApi
        .getIndirectPayList(params)
        .then((res: any) =>
          model.setIndirectPayRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      apSettlMgmtApi
        .getEachCostOrGlList(params)
        .then((res: any) =>
          model.setCostCenterRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      apSettlMgmtApi
        .getEachItmCostList(params)
        .then((res: any) =>
          model.setMaterialCostRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      apSettlMgmtApi
        .getDocFileList(params)
        .then((res: any) =>
          model.setEvidenceRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
    },
    [model],
  );

  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);
      fetchSubTabs(row);
    },
    [model, fetchSubTabs],
  );

  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
      model.resetSubGrids();
      handleRowClicked(data.rows?.[0]);
    },
    [model, handleRowClicked],
  );

  const doAction = useCallback(
    (apiCall: () => Promise<any>) => {
      apiCall().then(() => searchRef.current?.());
    },
    [searchRef],
  );

  const mainActions = [
    {
      type: "button",
      key: "BTN_AP_SETTLEMENT_CREATE",
      label: "BTN_AP_SETTLEMENT_CREATE",
      onClick: () =>
        doAction(() => apSettlMgmtApi.createClose(filtersRef.current)),
    },
    {
      type: "button",
      key: "BTN_AP_SETTLEMENT_DELETE",
      label: "BTN_AP_SETTLEMENT_DELETE",
      onClick: () =>
        doAction(() => apSettlMgmtApi.cancelClose(filtersRef.current)),
    },
    {
      type: "dropdown",
      key: "BTN_SEND_AP_SETL",
      label: "BTN_SEND_AP_SETL",
      items: [],
    },
    {
      type: "dropdown",
      key: "BTN_SEND_CNCL_AP_SETL",
      label: "BTN_SEND_CNCL_AP_SETL",
      items: [],
    },
    {
      type: "dropdown",
      key: "BTN_MNG_CST_DIST",
      label: "BTN_MNG_CST_DIST",
      items: [],
    },
    {
      type: "button",
      key: "BTB_SAVE",
      label: "BTB_SAVE",
      onClick: (e: any) => {
        const saveRows = (e.data ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        apSettlMgmtApi.save(saveRows).then(() => searchRef.current?.());
      },
    },
    {
      type: "button",
      key: "BTN_ATTACH_DOC",
      label: "BTN_ATTACH_DOC",
      onClick: () => {},
    },
    makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS,
      menuName: "매입정산관리",
      fetchFn: () => apSettlMgmtApi.getList(filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  const summaryActions = [
    makeExcelGroupAction({
      columns: [],
      menuName: "종합내역",
      fetchFn: () =>
        apSettlMgmtApi.getSummaryList({
          CLOSE_ID: model.selectedHeaderRowRef.current?.CLOSE_ID,
        }),
      rows: model.summaryRowData,
    }),
  ];

  const costCenterActions = [
    {
      type: "button",
      key: "BTN_COST_ACCOUNT_ADD",
      label: "BTN_COST_ACCOUNT_ADD",
      onClick: () => {
        if (!model.selectedHeaderRowRef.current) return;
        doAction(() =>
          apSettlMgmtApi.addCostCenter({
            CLOSE_ID: model.selectedHeaderRowRef.current.CLOSE_ID,
          }),
        );
      },
    },
    {
      type: "button",
      key: "BTN_SAVE",
      label: "BTN_SAVE",
      onClick: (e: any) => {
        const saveRows = (e.data ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        apSettlMgmtApi
          .saveCostCenter(saveRows)
          .then(() => fetchSubTabs(model.selectedHeaderRowRef.current));
      },
    },
    makeExcelGroupAction({
      columns: [],
      menuName: "코스트센터/계정별내역",
      fetchFn: () =>
        apSettlMgmtApi.getCostCenterList({
          CLOSE_ID: model.selectedHeaderRowRef.current?.CLOSE_ID,
        }),
      rows: model.costCenterRowData,
    }),
  ];

  const materialCostActions = [
    makeExcelGroupAction({
      columns: [],
      menuName: "원재료비내역",
      fetchFn: () =>
        apSettlMgmtApi.getMaterialCostList({
          CLOSE_ID: model.selectedHeaderRowRef.current?.CLOSE_ID,
        }),
      rows: model.materialCostRowData,
    }),
  ];

  const evidenceActions = [
    {
      type: "button",
      key: "BTN_SAVE",
      label: "BTN_SAVE",
      onClick: (e: any) => {
        const saveRows = (e.data ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        apSettlMgmtApi.save(saveRows).then(() => searchRef.current?.());
      },
    },
    {
      type: "button",
      key: "LBL_FILE_DOWNLOAD",
      label: "LBL_FILE_DOWNLOAD",
      onClick: () => {},
    },
  ];

  return {
    fetchList,
    handleSearch,
    handleRowClicked,
    mainActions,
    summaryActions,
    costCenterActions,
    materialCostActions,
    evidenceActions,
  };
}
