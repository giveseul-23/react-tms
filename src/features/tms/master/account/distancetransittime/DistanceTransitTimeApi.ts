import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CD } from "./DistanceTransitTime";

type commonResponse = {
  rows: [];
};

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();
  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }
  return { ...sessionFields, ...payload };
};

export const distanceTransitTimeApi = {
  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/distanceTransitTimeService/search`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  getHistoryList(payload: any) {
    return apiClient.post<commonResponse>(
      `/distanceTransitTimeService/searchAdd`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 시간거리계산(표준/미표준 공통) — 선택행 + BASE_TIME + IS_APPLY_STD_DISTANCE + MAP_NAME
  saveCalcDtto(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/distanceTransitTimeService/saveCalcDtto`,
      withSession({ MENU_CD: MENU_CD, dsSave: payload.dsSave }),
    );
  },

  // 경로탐색옵션 적용 — 선택행 + MAP_RTNG_OPTN_TCD
  saveMapSearchOption(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/distanceTransitTimeService/saveMapSearchOption`,
      withSession({ MENU_CD: MENU_CD, dsSave: payload.dsSave }),
    );
  },

  // 메인 저장 (TMAP거리적용도 동일 엔드포인트 — DIST=TMAP_DIST 후 저장)
  save(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/distanceTransitTimeService/save`,
      withSession({ MENU_CD: MENU_CD, dsSave: payload.dsSave }),
    );
  },

  // 추가 DTTO(sub) 저장
  saveAdd(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/distanceTransitTimeService/saveAdd`,
      withSession({ MENU_CD: MENU_CD, dsSave: payload.dsSave }),
    );
  },
};
