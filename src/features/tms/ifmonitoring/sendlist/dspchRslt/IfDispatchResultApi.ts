import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./IfDispatchResult";

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

export const ifDispatchResultApi = {
  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/ifDispatchResultService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  reprocess(payload: any) {
    return apiClient.post<commonResponse>(
      `/ifDispatchResultService/reprocess`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
