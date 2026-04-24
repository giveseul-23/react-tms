import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./ApDailyManagement";

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

export const apDailyManagementApi = {
  // 일일실적 메인 조회
  getDailyList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 사용 CHG_CD 조회 (동적 컬럼 메타)
  getUsedChgCd(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/getUsedChgCd`,
      withSession({
        module: "TMS",
        MENU_CD: MENU_CODE,
        DF_CHG_OP_DIV_TCD: "DAILY",
        ...payload,
      }),
    );
  },

  // 상세내역 조회
  getDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/searchDetail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 일일실적 생성
  createDailyResult(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/createDailyResult`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 일일실적 취소
  cancelDailyResult(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/cancelDailyResult`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 일마감
  closeDaily(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/closeDaily`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 일마감취소
  cancelDailyClose(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/cancelDailyClose`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 재계산
  recalculate(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/recalculate`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 저장
  save(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/save`,
      withSession(rows),
    );
  },

  // 운임 엑셀 업로드
  uploadFareExcel(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/uploadFareExcel`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
