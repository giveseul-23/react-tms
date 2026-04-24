// src/app/services/inTrnstVehCtrl/inTrnstVehCtrlApi.ts
import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./DtgDailyVehHisController";

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

export const dtgDailyVehHisControllerApi = {
  // ── 수송중 차량 조회 ────────────────────────────────────────
  getInTrnstVehList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/driveHistoryService/searchGroupedDrivingRecordsByDate",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  // ── 일일 운행이력 상세(주행경로) 조회 ───────────────────────
  searchDtgDailyHistory(payload: any) {
    return apiClient.post<CommonResponse>(
      "/driveHistoryService/searchDtgDailyHistory",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },
};
