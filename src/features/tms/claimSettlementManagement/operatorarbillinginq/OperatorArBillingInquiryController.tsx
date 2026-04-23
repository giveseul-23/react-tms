import { useCallback, MutableRefObject } from "react";
import { operatorArBillingInquiryApi } from "./OperatorArBillingInquiryApi";
import { OperatorArBillingInquiryModel } from "./OperatorArBillingInquiryModel";
import { MAIN_COLUMN_DEFS } from "./OperatorArBillingInquiryColumns";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";

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
  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      operatorArBillingInquiryApi.getList(params),
    [],
  );

  const fetchSubTabs = useCallback(
    (row: any) => {
      if (!row) return;
      const params = { SETL_DOC_NO: row.SETL_DOC_NO };

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

  const mainActions = [
    { type: "dropdown", key: "추적", label: "추적", items: [] },
    {
      type: "button",
      key: "계약변경",
      label: "계약변경",
      onClick: () =>
        doAction(() =>
          operatorArBillingInquiryApi.changeContract(filtersRef.current),
        ),
    },
    {
      type: "button",
      key: "매출재계산",
      label: "매출재계산",
      onClick: () =>
        doAction(() =>
          operatorArBillingInquiryApi.recalculateSales(filtersRef.current),
        ),
    },
    {
      type: "dropdown",
      key: "일마감",
      label: "일마감",
      items: [
        {
          key: "일마감",
          label: "일마감",
          onClick: () =>
            doAction(() =>
              operatorArBillingInquiryApi.dailyClose(filtersRef.current),
            ),
        },
      ],
    },
    {
      type: "dropdown",
      key: "매출확정",
      label: "매출확정",
      items: [
        {
          key: "매출확정",
          label: "매출확정",
          onClick: () =>
            doAction(() =>
              operatorArBillingInquiryApi.confirmSales(filtersRef.current),
            ),
        },
      ],
    },
    {
      type: "button",
      key: "정산문서취소",
      label: "정산문서취소",
      onClick: () =>
        doAction(() =>
          operatorArBillingInquiryApi.cancelSettlementDoc(filtersRef.current),
        ),
    },
    {
      type: "dropdown",
      key: "메모",
      label: "메모",
      items: [],
    },
    {
      type: "dropdown",
      key: "매출엑셀업로드",
      label: "매출엑셀업로드",
      items: [],
    },
    makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS,
      menuName: "운영자매출청구조회",
      fetchFn: () => operatorArBillingInquiryApi.getList(filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  const billingItemActions = [
    {
      type: "button",
      key: "계산결과추적",
      label: "계산결과추적",
      onClick: () =>
        doAction(() =>
          operatorArBillingInquiryApi.traceCalculation({
            SETL_DOC_NO: model.selectedHeaderRowRef.current?.SETL_DOC_NO,
          }),
        ),
    },
    {
      type: "button",
      key: "추가",
      label: "추가",
      onClick: () => {},
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
