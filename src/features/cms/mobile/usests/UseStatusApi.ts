import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";

export const MENU_CODE = "MENU_MBL_CTRL";

const withSession = (payload: Record<string, unknown> = {}) => ({
  ...getSessionFields(),
  MENU_CD: MENU_CODE,
  ...payload,
});

export const useStatusApi = {
  getMainList(payload: Record<string, unknown>) {
    return apiClient.post("/useStatusService/search", withSession(payload));
  },

  getFilterList(payload: Record<string, unknown>) {
    return apiClient.post("/useStatusService/searchFilter", withSession(payload));
  },

  getCarrierList(payload: Record<string, unknown>) {
    return apiClient.post("/useStatusService/searchCarr", withSession(payload));
  },
};

