import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CD } from "./Organization";

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

export const organizationApi = {
  // 디비전 조회
  getDivisionList(payload: any) {
    return apiClient.post<commonResponse>(
      `/organizationService/search`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 물류운영그룹 조회
  getLogisticsGroupList(payload: any) {
    return apiClient.post<commonResponse>(
      `/organizationService/searchLgstGrp`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  saveDivision(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/organizationService/saveDivision`,
      withSession(rows),
    );
  },

  saveLogisticsGroup(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/organizationService/saveLogisticsGroup`,
      withSession(rows),
    );
  },
};
