import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";

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
  MENU_CD: "MENU_AP_DAILY_MGMT",

  // 일일실적 메인 조회
  getDailyList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/searchDailyList`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 상세내역 조회
  getDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/searchDetailList`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 일일실적 생성
  createDailyResult(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/createDailyResult`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 일일실적 취소
  cancelDailyResult(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/cancelDailyResult`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 일마감
  closeDaily(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/closeDaily`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 일마감취소
  cancelDailyClose(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/cancelDailyClose`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 재계산
  recalculate(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/recalculate`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
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
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
};
