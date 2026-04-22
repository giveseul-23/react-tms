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

export const dispatchOperatorCostApi = {
  MENU_CD: "MENU_DSPCH_AP_CRATN_N_REVW",

  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/search`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 비용상세정보
  getCostDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/searchDispatchApplanDetail`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 비용상세 — 함수 서브
  getCostFunctionList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/searchCostInfoList`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 경유처
  getWaypointList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/searchPlanStop`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 증빙문서
  getEvidenceList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/searchDocFile`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 상단 액션
  changeContract(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/changeContract`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  calculateCost(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/calculateCost`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  adjustBulkDistance(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/adjustBulkDistance`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  recalculateMoveDistance(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/recalculateMoveDistance`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  closeDaily(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/closeDaily`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  confirmCost(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/confirmCost`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  deleteSettlement(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/deleteSettlement`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  save(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/save`,
      withSession(rows),
    );
  },
  createClose(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/createClose`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 경유처 - 정산경로 추가/복구/조정
  addSettlementRoute(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/addSettlementRoute`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  restoreRoute(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/restoreRoute`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  saveWaypoint(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/saveWaypoint`,
      withSession(rows),
    );
  },

  // 증빙문서 - 저장 / 첨부
  saveEvidence(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/saveEvidence`,
      withSession(rows),
    );
  },
  downloadEvidence(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchOperatorCostManagementService/downloadEvidence`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
};
