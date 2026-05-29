import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { commonResponse } from "@/app/services/common/commonApi";
const MENU_CD = "MENU_EXCEPTION_LOG";

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();
  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }
  return { ...sessionFields, ...payload };
};

export const userErrorLogApi = {
    getErrorDescription(payload: any) {
        return apiClient.post<commonResponse>(
            "/errorLogService/searchDtl",
            withSession({ MENU_CD, ...payload }),
        );
    },

    getList(payload: any) {
        return apiClient.post<commonResponse>(
            "/errorLogService/search",
            withSession({ MENU_CD, ...payload }),
        );
    },

};
