import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./OilPriceByDay";

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

const BASE = "/oilPriceByDayService";

export const oilPriceByDayApi = {
  // 일자별 평균유가 (메인) — 서버 store mainInfo proxy
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `${BASE}/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 광역시도별 평균유가 (sub01) — 서버 searchSido
  getSido(payload: any) {
    return apiClient.post<CommonResponse>(
      `${BASE}/searchSido`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 시군구별 평균유가 (sub02) — 서버 searchSigun
  getSigun(payload: any) {
    return apiClient.post<CommonResponse>(
      `${BASE}/searchSigun`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 추세조회 — 전체(일자) 시계열 (서버 searchAllPop)
  getTrendAll(payload: any) {
    return apiClient.post<CommonResponse>(
      `${BASE}/searchAllPop`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 추세조회 — 광역시도 시계열 (서버 searchSidoPop)
  getTrendSido(payload: any) {
    return apiClient.post<CommonResponse>(
      `${BASE}/searchSidoPop`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 추세조회 — 시군구 시계열 (서버 searchSigunPop)
  getTrendSigun(payload: any) {
    return apiClient.post<CommonResponse>(
      `${BASE}/searchSigunPop`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
