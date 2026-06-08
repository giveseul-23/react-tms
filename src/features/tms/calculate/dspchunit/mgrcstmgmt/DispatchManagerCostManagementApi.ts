import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./DispatchManagerCostManagement";

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
  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchManagerCostManagementService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getCostDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchManagerCostManagementService/searchDispatchApplanDetail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getWaypointList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchManagerCostManagementService/searchPlanStop`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 운영자확정취소
  cancelOperatorConfirm(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchManagerCostManagementService/saveRateOpConfirmCancel`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 관리자확정(승인)
  approveByManager(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchManagerCostManagementService/saveRateMgConfirm`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 관리자확정취소
  cancelManagerApprove(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchManagerCostManagementService/saveRateMgConfirmCancel`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 비용마감
  closeCost(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchManagerCostManagementService/saveRateClose`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 비용마감취소
  cancelCostClose(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchManagerCostManagementService/saveRateCloseCancel`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 비용상세 저장
  saveCostDetail(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/dispatchManagerCostManagementService/saveDetail`,
      withSession(rows),
    );
  },
};
