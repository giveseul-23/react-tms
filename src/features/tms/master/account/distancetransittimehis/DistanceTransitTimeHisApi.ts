import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./DistanceTransitTimeHis";

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

export const distanceTransitTimeHisApi = {
  // ── 메인 조회 ─────────────────────────────────────────────────
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/distanceTransitTimeHisService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 상세 조회 ─────────────────────────────────────────────────
  getDetailList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/distanceTransitTimeHisService/searchDetail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};