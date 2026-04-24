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

  addCostCenter(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/addCostCenter`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  saveCostCenter(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/saveCostCenter`,
      withSession(rows),
    );
  },

  // 메인 액션
  createClose(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/createClose`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  cancelClose(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/cancelClose`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  sendSap(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/sendSap`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  cancelSapSend(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/cancelSapSend`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  manageAllocation(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/manageAllocation`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  save(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/save`,
      withSession(rows),
    );
  },
  attachEvidence(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/attachEvidence`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
