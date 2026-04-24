// src/app/services/inTrnstVehCtrl/inTrnstVehCtrlApi.ts
import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./InTrnstVehCtrl";

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
  // ── 수송중 차량 조회 ────────────────────────────────────────
  getInTrnstVehList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/inTransitVehicleStatusService/search",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },
};
