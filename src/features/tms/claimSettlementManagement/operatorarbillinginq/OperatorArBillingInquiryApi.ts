import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";

type commonResponse = {
  rows: [];
};

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();
  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }
  return { ...sessionFields, ...payload };
};

export const operatorArBillingInquiryApi = {
  MENU_CD: "MENU_OPERATOR_BILLING_MANAGEMENT",

  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/search`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 청구항목
  getBillingItemList(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/searchBillingItem`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 주문정보
  getOrderInfoList(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/searchOrderInfo`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 증빙문서
  getAttachmentList(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/searchAttachment`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 계산결과 추적
  traceCalculation(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/traceCalculation`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  changeContract(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/changeContract`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  recalculateSales(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/recalculateSales`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  dailyClose(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/dailyClose`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  confirmSales(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/confirmSales`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  cancelSettlementDoc(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/cancelSettlementDoc`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  saveMemo(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/saveMemo`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  uploadSalesExcel(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/uploadSalesExcel`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  saveBillingItem(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/saveBillingItem`,
      withSession(rows),
    );
  },
};
