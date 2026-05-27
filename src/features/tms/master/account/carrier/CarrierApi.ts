import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./Carrier";

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

export const carrierApi = {
  // ── 메인 조회 ─────────────────────────────────────────────────
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/carrierService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 상세 조회 ─────────────────────────────────────────────────
  getBankList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/carrierService/searchBank`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

    getCompList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/carrierService/searchComp`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};