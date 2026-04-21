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

export const apSettlMgmtApi = {
  MENU_CD: "MENU_AP_SETTL_MGMT",

  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/searchList`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 종합내역
  getSummaryList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/searchSummary`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  // 종합내역 — 월대운임
  getMonthlyFareList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/searchMonthlyFare`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  // 종합내역 — 용차/배차지급
  getHireDispatchPayList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/searchHireDispatchPay`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  // 종합내역 — 물동지급
  getFreightPayList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/searchFreightPay`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  // 종합내역 — 간접비지급
  getIndirectPayList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/searchIndirectPay`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 코스트센터/계정별내역
  getCostCenterList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/searchCostCenter`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  addCostCenter(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/addCostCenter`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  saveCostCenter(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/saveCostCenter`,
      withSession(rows),
    );
  },

  // 원재료비내역
  getMaterialCostList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/searchMaterialCost`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 증빙문서
  getEvidenceList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/searchEvidence`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 메인 액션
  createClose(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/createClose`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  cancelClose(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/cancelClose`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  sendSap(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/sendSap`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  cancelSapSend(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/cancelSapSend`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  manageAllocation(payload: any) {
    return apiClient.post<commonResponse>(
      `/apSettlMgmtService/manageAllocation`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
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
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
};
