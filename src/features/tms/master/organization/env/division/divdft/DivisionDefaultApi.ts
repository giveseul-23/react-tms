import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./DivisionDefault";

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

export const divisionDefaultApi = {
  ////// SEARCH
  getDivisionDefaultList(payload: any) {
    return apiClient.post<commonResponse>(
      `/divisionConfigMasterService/search`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  getDivisionDefaultDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      "/divisionDefaultService/search",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },
};
