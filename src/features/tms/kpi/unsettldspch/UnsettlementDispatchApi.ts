import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./UnsettlementDispatch";

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

// KPI 미정산배차 조회 (서버 viewmodel store url 기준)
export const unsettlementDispatchApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/unsettlementDispatchService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
