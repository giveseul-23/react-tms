import { useCallback, MutableRefObject } from "react";
import { operatorArBillingInquiryApi } from "./OperatorArBillingInquiryApi";
import { OperatorArBillingInquiryModel } from "./OperatorArBillingInquiryModel";
import { MAIN_COLUMN_DEFS } from "./OperatorArBillingInquiryColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

type ControllerProps = {
  model: OperatorArBillingInquiryModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useOperatorArBillingInquiryController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  // PLN.AR_TO_DT 제외 + AR_FROM_DT / AR_TO_DT 리네임은 View 의
  // searchProps.excludes 선언으로 자동 처리됨 (SearchFilters 가 fetchFn 자동 wrap).
  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      operatorArBillingInquiryApi.getList(params),
    [],
  );

  const fetchSubTabs = useCallback(
    (row: any) => {
      if (!row) return;
      const params = { AR_ID: row.AR_ID };

      operatorArBillingInquiryApi
        .getBillingItemList(params)
        .then((res: any) =>
          model.setBillingItemRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      operatorArBillingInquiryApi
        .getOrderInfoList(params)
        .then((res: any) =>
          model.setOrderInfoRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      operatorArBillingInquiryApi
        .getAttachmentList(params)
        .then((res: any) =>
          model.setAttachmentRowData(
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

  const mainActions: ActionItem[] = [
    { type: "dropdown", key: "LBL_AR_TRACE", label: "LBL_AR_TRACE", items: [] },
    {
      type: "button",
      key: "BTN_RATESHOP",
      label: "BTN_RATESHOP",
      onClick: () =>
        doAction(() =>
          operatorArBillingInquiryApi.changeContract(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "LBL_AR_SALES_CALC",
      label: "LBL_AR_SALES_CALC",
      onClick: () =>
        doAction(() =>
          operatorArBillingInquiryApi.recalculateSales(filtersRef.current),
        ),
    },
    {
      type: "dropdown",
      key: "BTN_DLY_SETL",
      label: "BTN_DLY_SETL",
      items: [
        {
          key: "BTN_DLY_SETL",
          label: "BTN_DLY_SETL",
          onClick: () =>
            doAction(() =>
              operatorArBillingInquiryApi.dailyClose(filtersRef.current),
            ),
        },
      ],
    },
    {
      type: "dropdown",
      key: "LBL_AR_SALES_CONFIRM",
      label: "LBL_AR_SALES_CONFIRM",
      items: [
        {
          key: "LBL_AR_SALES_CONFIRM",
          label: "LBL_AR_SALES_CONFIRM",
          onClick: () =>
            doAction(() =>
              operatorArBillingInquiryApi.confirmSales(filtersRef.current),
            ),
        },
      ],
    },
    {
      type: "button",
      key: "LBL_AR_DELETE_SETTLEMENT_INFO",
      label: "LBL_AR_DELETE_SETTLEMENT_INFO",
      onClick: () =>
        doAction(() =>
          operatorArBillingInquiryApi.cancelSettlementDoc(filtersRef.current),
        ),
    },
    {
      type: "dropdown",
      key: "BTN_MEMO",
      label: "BTN_MEMO",
      items: [],
    },
    {
      type: "dropdown",
      key: "LBL_AR_SALES_EXCEL_UPLOAD",
      label: "LBL_AR_SALES_EXCEL_UPLOAD",
      items: [],
    },
    makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS,
      menuName: "운영자매출청구조회",
      fetchFn: () => operatorArBillingInquiryApi.getList(filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  const billingItemActions: ActionItem[] = [
    {
      type: "button",
      key: "LBL_AR_CALC_RESULT_TRACE",
      label: "LBL_AR_CALC_RESULT_TRACE",
      onClick: () =>
        doAction(() =>
          operatorArBillingInquiryApi.traceCalculation({
            SETL_DOC_NO: model.selectedHeaderRowRef.current?.SETL_DOC_NO,
          }),
        ),
    },
    {
      type: "button",
      key: "BTN_ADD",
      label: "BTN_ADD",
      onClick: () => {},
    },
    {
      type: "button",
      key: "BTN_SAVE",
      label: "BTN_SAVE",
      onClick: (e: any) => {
        const saveRows = dirtyRows(e.data);
        if (saveRows.length === 0) return;
        operatorArBillingInquiryApi
          .saveBillingItem(saveRows)
          .then(() => fetchSubTabs(model.selectedHeaderRowRef.current));
      },
    },
  ];

  const orderInfoActions: any[] = [];
  const attachmentActions: any[] = [];

  return {
    fetchList,
    handleSearch,
    handleRowClicked,
    mainActions,
    billingItemActions,
    orderInfoActions,
    attachmentActions,
  };
}
