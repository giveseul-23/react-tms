import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./RateBatch";

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

export const rateBatchApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/rateBatchService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getConditionInfoList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/rateBatchService/searchConditionInfoList",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  save(payload: { dsSave: any[] }) {
    return apiClient.post<CommonResponse>(
      "/rateBatchService/save",
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },

  saveConditionInfo(payload: { dsSave: any[] }) {
    return apiClient.post<CommonResponse>(
      "/rateBatchService/saveConditionInfo",
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },
};
