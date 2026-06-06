import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CD } from "./OperatorArBillingInquiry";

// 서버 메인 그리드 authId — 업로드 GRID_ID / 다운로드 파일 조회 키로 사용 (센차 grid.authId 대응).
export const GRID_ID = "MAIN_GRID_OPERATOR_AR_BILLING_INQUIRY";

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
  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/searchOperatorArBillingHeader`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 청구항목
  getBillingItemList(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/searchOperatorArBillingChargeDetail`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 주문정보
  getOrderInfoList(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/searchOperatorArBillingShipmentInform`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 증빙문서
  getAttachmentList(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/searchOperatorArBillingAttachment`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 매출 이벤트 이력
  getArEventHistory(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/searchArEventHistory`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 계산결과 추적
  traceCalculation(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/traceCalculation`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  changeContract(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/changeContract`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  recalculateSales(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/recalculateSales`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  dailyClose(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/dailyClose`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  confirmSales(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/confirmSales`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  cancelSettlementDoc(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/cancelSettlementDoc`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 메모 등록 — 선택행에 MEMO 세팅 후 저장. (센차 onSaveMemo, rowStatus 'U')
  saveMemo(rows: any[], text: string) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/saveMemo`,
      withSession(
        rows.map((r) => ({ ...r, MEMO: text, EDIT_STS: "U", MENU_CD: MENU_CD })),
      ),
    );
  },

  // 메모 등록취소. (센차 onCancelMemo)
  cancelMemo(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/cancelMemo`,
      withSession(rows.map((r) => ({ ...r, EDIT_STS: "U", MENU_CD: MENU_CD }))),
    );
  },

  // 매출 엑셀 다운로드 — 1단계: 검색조건으로 서버 임시데이터 준비.
  downloadArExcelPrepare(payload: any) {
    return apiClient.post(
      `/operatorArBillingInquiryService/downloadExcelPrepare`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 매출 엑셀 다운로드 — 2단계: 준비된 파일 스트림(blob) 수신. (MENU_CD 파라미터 = grid authId)
  downloadArExcelFile() {
    return apiClient.get(`/operatorArBillingInquiryService/downloadExcel`, {
      params: withSession({ MENU_CD: GRID_ID }),
      responseType: "blob",
    });
  },

  saveBillingItem(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/saveBillingItem`,
      withSession(rows),
    );
  },
};
