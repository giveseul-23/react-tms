import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";

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

export const accessHistApi = {
  getAccessHist(menuCd: string, payload: any) {
    return apiClient.post<CommonResponse>(
      "/accessHistService/search",
      withSession({ MENU_CD: menuCd, ...payload }),
    );
  },

};
