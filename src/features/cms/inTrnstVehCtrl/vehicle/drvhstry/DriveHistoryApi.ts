// src/app/services/inTrnstVehCtrl/inTrnstVehCtrlApi.ts
import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";

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

export const driveHistoryApi = {
  MENU_CD: "MENU_DRIVE_HISTORY",

  // ── 수송중 차량 조회 ────────────────────────────────────────
  getInTrnstVehList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/driveHistoryService/search",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },

  // ── 배차 실주행 경로(trace) 조회 ────────────────────────────
  searchDispathTrace(payload: any) {
    return apiClient.post<CommonResponse>(
      "/traceService/searchDispathTrace",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },

  // ── 배차 정차지(route) 조회 ────────────────────────────────
  getDlvryRoute(payload: any) {
    return apiClient.post<CommonResponse>(
      "/mapService/getDlvryRoute",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },
};
