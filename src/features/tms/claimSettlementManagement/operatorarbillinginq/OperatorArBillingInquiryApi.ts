import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CD } from "./OperatorArBillingInquiry";

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
      `/operatorArBillingInquiryService/searchOperatorArBillingAttachmentPreview`,
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

  // 현재계약 재계산
  recalculateSales(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/recalculateCurrentContract`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 일정산 / 일정산취소
  dailyClose(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/dailySettlement`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },
  cancelDailyClose(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/cancelDailySettlement`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 청구확정 / 확정취소
  confirmSales(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/confirmAr`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },
  cancelSettlementDoc(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/cancelConfirmAr`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },
  // 청구(매출) 취소
  cancelAr(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/cancelAr`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },
  // GL 코드 변경 / 확정요율·사유 저장
  changeGeneralLedgerCode(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/changeGeneralLedgerCode`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },
  saveConfirmRateAndReason(payload: any) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/saveConfirmRateAndReason`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 메모 등록 — 선택행에 MEMO 세팅 후 저장. (센차 onSaveMemo, rowStatus 'U')
  saveMemo(rows: any[], text: string) {
    return apiClient.post<commonResponse>(
      `/operatorArBillingInquiryService/saveMemo`,
      withSession(
        rows.map((r) => ({
          ...r,
          MEMO: text,
          EDIT_STS: "U",
          MENU_CD: MENU_CD,
        })),
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
      // MENU_CD 파라미터 = 메인 그리드 authId (런타임 참조 — 순환 import TDZ 회피).
      params: withSession({ MENU_CD: MENU_CD }),
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
