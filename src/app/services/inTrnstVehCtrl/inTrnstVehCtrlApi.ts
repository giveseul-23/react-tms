// src/app/services/inTrnstVehCtrl/inTrnstVehCtrlApi.ts
import { apiClient } from "@/app/api/client";
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

export const inTrnstVehCtrlApi = {
  MENU_CD: "MENU_IN_TRNST_VEH_CTRL",

  // ── 수송중 차량 조회 ────────────────────────────────────────
  getInTrnstVehList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/inTrnstVehCtrlService/search",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },

  // ── 차량 최신 위치 조회 (단건) ──────────────────────────────
  getVehicleLocation(payload: any) {
    return apiClient.post<CommonResponse>(
      "/inTrnstVehCtrlService/searchVehicleLocation",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },
};
