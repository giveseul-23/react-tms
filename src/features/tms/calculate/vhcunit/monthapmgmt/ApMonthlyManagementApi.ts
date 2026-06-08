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

  // 월비용 취소
  cancelMonthlyResult(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/cancelMonthlyAp`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 수기요율 엑셀 등록 / 양식 다운로드
  uploadManualCostExcel(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/uploadManualRate`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  downloadManualRatePrepare(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/downloadManualRatePrepare`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 통행료(하이패스) 집계 / 취소
  aggregationTollRate(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/aggregationTollRate`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  cancelTollRate(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/cancelTollRate`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 월정산 리포트
  reportApMonthly(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/reportApMonthly`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  save(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/save`,
      withSession(payload),
    );
  },

  // 정산 확정 / 확정취소
  confirm(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/updateMonthlyApConfirm`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  cancelConfirm(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/updateMonthlyApConfirmCancel`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
