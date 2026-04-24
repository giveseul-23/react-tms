import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./LogisticGroupDefault";

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

export const logisticGroupDefaultApi = {
  ////// SEARCH
  getLgstDefaultCnfgGrpList(payload: any) {
    return apiClient.post<commonResponse>(
      `/logisticGroupDefaultService/search`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  getLgstDefaultCnfgList(payload: any) {
    return apiClient.post<commonResponse>(
      "/logisticGroupDefaultService/searchCnfg",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  getLgstDefaultDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      "/logisticGroupDefaultService/searchCnfgDtl",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },
};
