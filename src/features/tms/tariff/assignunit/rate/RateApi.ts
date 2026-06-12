import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./Rate";

type CommonResponse = {
  rows: [];
};

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();
  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }
  return { ...sessionFields, ...payload };
};

export const rateApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/rateService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getCostInfoList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/rateService/searchCostInfoList",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getConditionInfoList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/rateService/searchConditionInfoList",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  save(payload: { dsSave: any[] }) {
    return apiClient.post<CommonResponse>(
      "/rateService/save",
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },

  saveCostInfo(payload: { dsSave: any[] }) {
    return apiClient.post<CommonResponse>(
      "/rateService/saveCostInfo",
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },

  saveConditionInfo(payload: { dsSave: any[] }) {
    return apiClient.post<CommonResponse>(
      "/rateService/saveConditionInfo",
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },
};
