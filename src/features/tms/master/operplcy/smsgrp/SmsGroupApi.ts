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

export const smsGroupApi = {
  MENU_CD: "MENU_SMS_GRP_MGMT",
  ////// SEARCH
  getSmsGroupList(payload: any) {
    return apiClient.post<commonResponse>(
      `/smsGroupService/search`,
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },

  getSmsGroupDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      "/smsGroupService/searchDetail",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },
};
