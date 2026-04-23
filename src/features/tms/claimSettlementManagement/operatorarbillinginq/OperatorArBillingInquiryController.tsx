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
  // JS onSaveAfterSearch + buildOperatorArBillingHeaderParams 매칭:
  //   - DYNAMIC_QUERY 는 정상 전송. 단 PLN.AR_TO_DT 는 기본 빌더의 TO_TIMESTAMP
  //     포맷을 쓰지 않도록 excludeKeysRef 로 조건 생성에서 skip.
  //   - PLN.AR_TO_DT 의 from/to 값은 지정 양식
  //       AND PLN.AR_TO_DT BETWEEN TO_DATE('YYYY-MM-DD', 'YYYYMMDD')
  //                            AND TO_DATE('YYYY-MM-DD', 'YYYYMMDD')
  //     로 직접 만들어 DYNAMIC_QUERY 에 이어붙여 전송.
  //   - useSearchExecute 가 dbColumnFilters / extraParams 양쪽에 남기는
  //     PLN_AR_TO_DT_* / PLN.AR_TO_DT_* 흔적은 모두 제거.
  const fetchList = useCallback((params: Record<string, unknown>) => {
    const cleaned: Record<string, unknown> = { ...params };

    const from = cleaned["PLN.AR_TO_DT_FRM"] ?? cleaned["PLN_AR_TO_DT_FRM"];
    const to = cleaned["PLN.AR_TO_DT_TO"] ?? cleaned["PLN_AR_TO_DT_TO"];

    delete cleaned["PLN.AR_TO_DT_FRM"];
    delete cleaned["PLN.AR_TO_DT_TO"];
    delete cleaned["PLN_AR_TO_DT_FRM"];
    delete cleaned["PLN_AR_TO_DT_TO"];

    if (from && to) {
      const fromStr = String(from).replace(/-/g, "");
      const toStr = String(to).replace(/-/g, "");
      const clause =
        ` AND PLN.AR_TO_DT BETWEEN TO_DATE('${fromStr}', 'YYYYMMDD')` +
        ` AND TO_DATE('${toStr}', 'YYYYMMDD')`;
      const existing = String(cleaned.DYNAMIC_QUERY ?? "1=1");
      cleaned.DYNAMIC_QUERY = existing + clause;
    }

    return operatorArBillingInquiryApi.getList(cleaned);
  }, []);

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
