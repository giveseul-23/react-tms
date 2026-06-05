import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";

export const MENU_CODE = "MENU_DTG_DAILY_TEMPER_HIS";

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

export const dtgDailyTemperHisApi = {
  getDailyTemperHistory(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/driveHistoryService/searchDailyTemperHistory",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  getTemperatureHistory(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/driveHistoryService/searchTemperatureHistory",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },
};
