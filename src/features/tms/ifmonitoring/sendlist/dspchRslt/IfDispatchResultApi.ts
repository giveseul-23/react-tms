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

export const ifDispatchResultApi = {
  MENU_CD: "MENU_IF_SEND_DSPCH_RSLT",

  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/ifDispatchResultService/searchList`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  reprocess(payload: any) {
    return apiClient.post<commonResponse>(
      `/ifDispatchResultService/reprocess`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
};
