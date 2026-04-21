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
      key: "마감생성",
      label: "마감생성",
      onClick: () =>
        doAction(() => apSettlMgmtApi.createClose(filtersRef.current)),
    },
    {
      type: "button",
      key: "마감취소",
      label: "마감취소",
      onClick: () =>
        doAction(() => apSettlMgmtApi.cancelClose(filtersRef.current)),
    },
    {
      type: "dropdown",
      key: "SAP전송",
      label: "SAP전송",
      items: [],
    },
    {
      type: "dropdown",
      key: "SAP전송취소",
      label: "SAP전송취소",
      items: [],
    },
    {
      type: "dropdown",
      key: "배부관리",
      label: "배부관리",
      items: [],
    },
    {
      type: "button",
      key: "저장",
      label: "저장",
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
      key: "증빙문서첨부",
      label: "증빙문서첨부",
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
      key: "계정추가",
      label: "계정추가",
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
      key: "저장",
      label: "저장",
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
      key: "저장",
      label: "저장",
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
      key: "첨부파일다운로드",
      label: "첨부파일 다운로드",
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
