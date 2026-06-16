import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./OnTimeDeliveryResult";

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

// 납기준수실적 — 조회 전용 화면 (서버 /onTimeDeliveryResultService/search)
export const onTimeDeliveryResultApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/onTimeDeliveryResultService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
