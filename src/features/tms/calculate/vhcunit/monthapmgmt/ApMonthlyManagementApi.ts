import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./ApMonthlyManagement";

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

export const apMonthlyManagementApi = {
  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 사용 CHG_CD 조회 (동적 컬럼 메타)
  getUsedChgCd(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/getUsedChgCd`,
      withSession({
        module: "TMS",
        MENU_CD: MENU_CODE,
        DF_CHG_OP_DIV_TCD: "MONTHLY",
        ...payload,
      }),
    );
  },

  createMonthlyResult(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/createMonthlyResult`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  cancelMonthlyResult(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/cancelMonthlyResult`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  uploadManualCostExcel(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/uploadManualCostExcel`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  save(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/save`,
      withSession(rows),
    );
  },

  confirm(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/confirm`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  cancelConfirm(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/cancelConfirm`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
