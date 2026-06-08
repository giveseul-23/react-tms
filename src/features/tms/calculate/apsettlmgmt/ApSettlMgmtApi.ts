import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./ApSettlMgmt";

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

export const apSettlMgmtApi = {
  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/searchClosingList`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 종합내역
  getSummaryList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/searchClosingSummary`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 종합내역 — 월대운임
  getMonthlyFareList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/searchClosingDetailDf`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 종합내역 — 용차/배차지급
  getHireDispatchPayList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/searchClosingDetailCf`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 종합내역 — 물동지급
  getFreightPayList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/searchClosingItemQty`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 종합내역 — 간접비지급
  getIndirectPayList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/searchClosingDetailOverhead`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 비용별/GL별 내역
  getEachCostOrGlList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/searchApEachCostOrGl`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 항목별 비용 내역
  getEachItmCostList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/searchApEachItmCost`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 첨부파일
  getDocFileList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/searchDocFile`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 비용센터(GL) 저장
  addCostCenter(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/saveCostGlInfo`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  saveCostCenter({ dsSave }: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/saveCostGlInfo`,
      withSession(dsSave),
    );
  },

  // 메인 액션
  // 마감(지급정산 생성) / 마감취소
  createClose(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/createApSettlement`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  cancelClose(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/cancelApSettlement`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 확정 / 확정취소
  confirmApSettlement(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/confirmApSettlement`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  confirmCancelApSettlement(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/confirmCancelApSettlement`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 월비용배분 전송 / 전송취소
  sendSap(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/sendMnthyCstDist`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  cancelSapSend(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/cancelSendMnthyCstDist`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 월비용배분 실행 / 취소
  manageAllocation(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/exeMnthyCstDist`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  cancelAllocation(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/cancelMnthyCstDist`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  save({ dsSave }: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/save`,
      withSession(dsSave),
    );
  },
  // 증빙 첨부 저장
  attachEvidence(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/saveDoc`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
