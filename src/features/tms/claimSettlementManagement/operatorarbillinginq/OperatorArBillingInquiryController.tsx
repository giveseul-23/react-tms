import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  operatorArBillingInquiryApi as api,
  GRID_ID,
} from "./OperatorArBillingInquiryApi";
import { MENU_CD } from "./OperatorArBillingInquiry";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
  makeExcelUploadAction,
  makeMemoGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import { showErrorModal } from "@/app/components/popup/showErrorModal";
import { Lang } from "@/app/services/common/Lang";
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

  // 매출 엑셀 다운로드 — 검색조건 검증 → prepare → 파일(blob) 다운로드. (센차 onDownloadArTemplate 대응)
  const onDownloadArExcel = useCallback(async () => {
    const f = (model.rawFiltersRef.current ?? {}) as Record<string, any>;
    const params = {
      DIV_CD: f.SRCH_PLN_DIV_CD,
      LGST_GRP_CD: f.SRCH_PLN_LGST_GRP_CD,
      AR_TO_DT_FROM: f.SRCH_PLN_AR_TO_DT_FRM,
      AR_TO_DT_TO: f.SRCH_PLN_AR_TO_DT_TO,
      CUST_CD: f.SRCH_PLN_CUST_CD,
    };
    if (
      !params.DIV_CD ||
      !params.LGST_GRP_CD ||
      !params.AR_TO_DT_FROM ||
      !params.AR_TO_DT_TO ||
      !params.CUST_CD
    ) {
      base.alert(Lang.get("MSG_CHECK_SEARCH_CONDITION"));
      return;
    }
    try {
      const prep = await api.downloadArExcelPrepare(params);
      if ((prep.data as any)?.success === false) {
        showErrorModal((prep.data as any)?.msg ?? Lang.get("TTL_ERR"));
        return;
      }
      const res = await api.downloadArExcelFile();
      const cd = (res.headers?.["content-disposition"] as string) ?? "";
      const m = cd.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)/i);
      const fileName = m
        ? decodeURIComponent(m[1])
        : `${String(menuName).replaceAll(" ", "_").replaceAll("/", " ") + Date.now()}.xlsx`;
      const url = URL.createObjectURL(new Blob([res.data as BlobPart]));
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      showErrorModal(e?.message ?? Lang.get("TTL_ERR"));
    }
  }, [base, menuName, model.rawFiltersRef]);

  // 매출 엑셀 업로드 — 공통 업로드 버튼 (센차 gridExcelUpload 대응). 성공 시 재조회.
  const uploadArExcelAction = useMemo(
    () =>
      makeExcelUploadAction({
        key: "LBL_AR_UPLOAD",
        label: "LBL_AR_UPLOAD",
        menuCode: MENU_CD,
        gridId: GRID_ID,
        onUploaded: () => base.search(),
      }),
    [base],
  );

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
      makeMemoGroupAction({
        saveMemo: (rows, text) => api.saveMemo(rows, text),
        cancelMemo: (rows) => api.cancelMemo(rows),
        onDone: () => base.search(),
        confirmOnCancel: true,
        noSelectionMsg: "MSG_SELECT_TARGET_FOR_AR_MEMO",
        popupInfo: (rows) =>
          Lang.get("MSG_AR_MEMO_BATCH_REG_INFO_BY_OP", String(rows.length)),
        // 센차 checkValidForChange — AR_FI_STS 가 5010/5020 일 때만 메모 등록/취소 가능.
        validate: (rows, mode) => {
          const ok = rows.every(
            (r: any) => r.AR_FI_STS === "5010" || r.AR_FI_STS === "5020",
          );
          if (!ok) {
            base.alert(
              Lang.get(
                mode === "register"
                  ? "MSG_INVALID_AR_STS_OF_FOR_MEMO_REG_BY_OP"
                  : "MSG_INVALID_AR_STS_OF_FOR_MEMO_CAN_BY_OP",
              ),
            );
            return false;
          }
          return true;
        },
      }),
      {
        type: "group",
        key: "LBL_AR_SALES_EXCEL_UPLOAD",
        label: "LBL_AR_SALES_EXCEL_UPLOAD",
        items: [
          {
            type: "button",
            key: "LBL_AR_DOWNLOAD",
            label: "LBL_AR_DOWNLOAD",
            onClick: onDownloadArExcel,
          },
          uploadArExcelAction,
        ],
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [
      base,
      doAction,
      menuName,
      model.filtersRef,
      model.grids.main,
      onDownloadArExcel,
      uploadArExcelAction,
    ],
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
