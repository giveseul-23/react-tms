import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./SmsGroup";

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

export const smsGroupApi = {
  ////// SEARCH
  getSmsGroupList(payload: any) {
    return apiClient.post<commonResponse>(
      `/smsGroupService/search`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  getSmsGroupDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      "/smsGroupService/searchDetail",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },
};
