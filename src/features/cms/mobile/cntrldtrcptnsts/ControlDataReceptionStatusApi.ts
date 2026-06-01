import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./ControlDataReceptionStatus";

type CommonResponse = {
  rows: [];
};

const withSession = (payload: Record<string, unknown> = {}) => {
  const sessionFields = getSessionFields();
  return { ...sessionFields, ...payload };
};

export const controlDataReceptionStatusApi = {
  getList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/controlDataReceptionStatusService/search",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },
};
