import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./IfConfirmLoading";

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

export const ifConfirmLoadingApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/ifConfirmLoadingService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  reprocess(payload: any) {
    return apiClient.post<CommonResponse>(
      `/ifConfirmLoadingService/reprocess`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
