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

export const dispatchManagerCostApi = {
  MENU_CD: "MENU_DSPCH_AP_APPROVAL_AND_CLOSING",

  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchManagerCostManagementService/search`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  getCostDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchManagerCostManagementService/searchDispatchApplanDetail`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  getWaypointList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchManagerCostManagementService/searchPlanStop`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 운영자확정취소
  cancelOperatorConfirm(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchManagerCostManagementService/cancelOperatorConfirm`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  // 관리자승인
  approveByManager(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchManagerCostManagementService/approveByManager`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  // 관리자승인취소
  cancelManagerApprove(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchManagerCostManagementService/cancelManagerApprove`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  // 비용마감
  closeCost(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchManagerCostManagementService/closeCost`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  // 비용마감취소
  cancelCostClose(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchManagerCostManagementService/cancelCostClose`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  // 비용상세 저장
  saveCostDetail(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/dispatchManagerCostManagementService/saveCostDetail`,
      withSession(rows),
    );
  },
};
