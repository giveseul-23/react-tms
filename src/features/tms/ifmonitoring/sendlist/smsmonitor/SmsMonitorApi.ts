import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./SmsMonitor";

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

// 서버 proxy url: /smsMonitorService/search (조회 전용 모니터링 화면)
export const smsMonitorApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/smsMonitorService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
