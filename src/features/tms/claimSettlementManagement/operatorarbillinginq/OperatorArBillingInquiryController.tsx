import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { operatorArBillingInquiryApi as api } from "./OperatorArBillingInquiryApi";
import { MENU_CD } from "./OperatorArBillingInquiry";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  OperatorArBillingInquiryModel,
  GridKey,
} from "./OperatorArBillingInquiryModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

const masterParam = (row: any) => ({ AR_ID: row?.AR_ID });

interface Args {
  model: OperatorArBillingInquiryModel;
}

export function useOperatorArBillingInquiryController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "billingItem",
          fetch: (r) => api.getBillingItemList(masterParam(r)),
        },
        {
          to: "orderInfo",
          fetch: (r) => api.getOrderInfoList(masterParam(r)),
        },
        {
          to: "attachment",
          fetch: (r) => api.getAttachmentList(masterParam(r)),
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
      base.callAjax(apiCall(), msg).then(() => base.search()),
    [base],
  );

  const refetchSubTabs = useCallback(() => {
    const row = model.grids.main.selectedRef.current;
    if (row) onMainGridClick(row);
  }, [model.grids.main, onMainGridClick]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_RATESHOP",
        label: "BTN_RATESHOP",
        onClick: () =>
          doAction(() => api.changeContract(model.filtersRef.current)),
      },
      {
        type: "button",
        key: "LBL_AR_SALES_CALC",
        label: "LBL_AR_SALES_CALC",
        onClick: () =>
          doAction(() => api.recalculateSales(model.filtersRef.current)),
      },
      {
        type: "group",
        key: "BTN_DLY_SETL",
        label: "BTN_DLY_SETL",
        items: [
          {
            type: "button",
            key: "BTN_DLY_SETL",
            label: "BTN_DLY_SETL",
            onClick: () =>
              doAction(() => api.dailyClose(model.filtersRef.current)),
          },
        ],
      },
      {
        type: "group",
        key: "LBL_AR_SALES_CONFIRM",
        label: "LBL_AR_SALES_CONFIRM",
        items: [
          {
            type: "button",
            key: "LBL_AR_SALES_CONFIRM",
            label: "LBL_AR_SALES_CONFIRM",
            onClick: () =>
              doAction(() => api.confirmSales(model.filtersRef.current)),
          },
        ],
      },
      {
        type: "button",
        key: "LBL_AR_DELETE_SETTLEMENT_INFO",
        label: "LBL_AR_DELETE_SETTLEMENT_INFO",
        onClick: () =>
          doAction(() => api.cancelSettlementDoc(model.filtersRef.current)),
      },
      {
        type: "group",
        key: "BTN_MEMO",
        label: "BTN_MEMO",
        items: [],
      },
      {
        type: "group",
        key: "LBL_AR_SALES_EXCEL_UPLOAD",
        label: "LBL_AR_SALES_EXCEL_UPLOAD",
        items: [],
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [doAction, menuName, model.filtersRef, model.grids.main],
  );

  const billingItemActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "LBL_AR_CALC_RESULT_TRACE",
        label: "LBL_AR_CALC_RESULT_TRACE",
        onClick: () =>
          doAction(() =>
            api.traceCalculation({
              SETL_DOC_NO: model.grids.main.selectedRef.current?.SETL_DOC_NO,
            }),
          ),
      },
      makeAddAction({ onClick: () => {} }),
      makeSaveAction({
        onClick: (e: any) => {
          const saveRows = dirtyRows(e.data);
          if (saveRows.length === 0) return;
          api.saveBillingItem(saveRows).then(() => refetchSubTabs());
        },
      }),
    ],
    [doAction, refetchSubTabs, model],
  );

  const orderInfoActions: ActionItem[] = useMemo(() => [], []);
  const attachmentActions: ActionItem[] = useMemo(() => [], []);

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    billingItemActions,
    orderInfoActions,
    attachmentActions,
  };
}
