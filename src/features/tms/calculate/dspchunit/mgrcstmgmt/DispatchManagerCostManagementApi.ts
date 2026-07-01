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

const dsSavePost = (url: string, rows: any[]) =>
  apiClient.post<commonResponse>(
    url,
    { dsSave: rows },
    {
      params: { ...getSessionFields(), MENU_CD: MENU_CODE },
    },
  );

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
  cancelOperatorConfirm(rows: any[]) {
    return dsSavePost(
      `/dispatchManagerCostManagementService/saveRateOpConfirmCancel`,
      rows,
    );
  },
  // 관리자확정(승인)
  approveByManager(rows: any[]) {
    return dsSavePost(
      `/dispatchManagerCostManagementService/saveRateMgConfirm`,
      rows,
    );
  },
  // 관리자확정취소
  cancelManagerApprove(rows: any[]) {
    return dsSavePost(
      `/dispatchManagerCostManagementService/saveRateMgConfirmCancel`,
      rows,
    );
  },
  // 비용마감
  closeCost(rows: any[]) {
    return dsSavePost(
      `/dispatchManagerCostManagementService/saveRateClose`,
      rows,
    );
  },
  // 비용마감취소
  cancelCostClose(rows: any[]) {
    return dsSavePost(
      `/dispatchManagerCostManagementService/saveRateCloseCancel`,
      rows,
    );
  },
  // 비용상세 저장
  saveCostDetail(rows: any[]) {
    return dsSavePost(
      `/dispatchManagerCostManagementService/saveDetail`,
      rows,
    );
  },
};
