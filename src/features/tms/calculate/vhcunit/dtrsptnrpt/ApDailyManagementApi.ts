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

const sessionParams = (params: Record<string, any> = {}) => ({
  ...getSessionFields(),
  MENU_CD: MENU_CODE,
  ...params,
});

const dsSavePost = (url: string, rows: any[], params: Record<string, any> = {}) =>
  apiClient.post<commonResponse>(
    url,
    { dsSave: rows },
    { params: sessionParams(params) },
  );

const postUpload = (
  url: string,
  file: File,
  params: Record<string, any> = {},
) => {
  const form = new FormData();
  form.append("UPLOAD_FILE", file);
  form.append("MENU_CD", MENU_CODE);
  form.append("JSON_READ_PASS", "Y");
  Object.entries({ ...getSessionFields(), ...params }).forEach(([key, value]) =>
    form.append(key, String(value ?? "")),
  );
  return apiClient.post<commonResponse>(url, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
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

  // 일일실적(비용) 생성
  createDailyResult(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/createDailyAp`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 일일실적(비용) 취소
  cancelDailyResult(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/cancelDailyAp`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 일정산(배차종료처리)
  closeDaily(payload: any) {
    return dsSavePost(`/apDailyManagementService/saveDlySetl`, payload.dsSave);
  },

  // 일정산취소(배차종료복원)
  cancelDailyClose(payload: any) {
    return dsSavePost(
      `/apDailyManagementService/saveDlySetlCancel`,
      payload.dsSave,
    );
  },

  // 요율 재계산
  recalculate(payload: any) {
    return dsSavePost(`/apDailyManagementService/calcRate`, payload.dsSave);
  },

  calcDistance(payload: any) {
    return dsSavePost(`/apDailyManagementService/calcDistance`, payload.dsSave);
  },

  // 요율 취소 / 복원
  onRateCancel(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/onRateCancel`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  onRateCancelRestore(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/onRateCancelRestore`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 저장
  save(rows: any[]) {
    return dsSavePost(`/apDailyManagementService/save`, rows);
  },

  // 엑셀 업로드 (운임/유가/요율) + 요율양식 다운로드
  downloadFuelFareTemplate() {
    return apiClient.get(`/apDailyManagementService/downloadFuelFareTemplate`, {
      params: sessionParams({ MENU_CD: "MAIN_GRID_AP_DAILY_MGMT" }),
      responseType: "blob",
    });
  },
  uploadFreight(file: File, params: any) {
    return postUpload(`/apDailyManagementService/uploadFreight`, file, params);
  },
  downloadFreightTemplate() {
    return apiClient.get(`/apDailyManagementService/downloadFreightTemplate`, {
      params: sessionParams(),
      responseType: "blob",
    });
  },
  uploadFuelFare(file: File, params: any) {
    return postUpload(`/apDailyManagementService/uploadFuelFare`, file, params);
  },
  uploadRate(file: File, params: any) {
    return postUpload(`/apDailyManagementService/uploadRate`, file, params);
  },
  downloadRatePrepare(payload: any) {
    return apiClient.post<commonResponse>(
      `/apDailyManagementService/downloadRatePrepare`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  downloadRate() {
    return apiClient.get(`/apDailyManagementService/downloadRate`, {
      params: sessionParams({ MENU_CD: "MAIN_GRID_AP_DAILY_MGMT" }),
      responseType: "blob",
    });
  },

  // (구) uploadFareExcel 호환 — 운임 업로드로 위임
  uploadFareExcel(file: File, params: any) {
    return postUpload(`/apDailyManagementService/uploadFreight`, file, params);
  },

  // 메모 등록 — 선택행에 MEMO_DESC 세팅 후 저장. (센차 onSaveApplnMemo, rowStatus 'I')
  saveMemo(rows: any[], text: string) {
    return dsSavePost(
      `/apDailyManagementService/saveApplnMemo`,
      rows.map((r) => {
        const { __rid__, EDIT_STS: _EDIT_STS, ...rest } = r;
        return {
          ...rest,
          MEMO_DESC: text,
          rowStatus: "I",
          MENU_CD: MENU_CODE,
        };
      }),
    );
  },

  // 메모 등록취소. (센차 onCancelApplnMemo)
  cancelMemo(rows: any[]) {
    return dsSavePost(
      `/apDailyManagementService/cancelApplnMemo`,
      rows.map((r) => {
        const { __rid__, EDIT_STS: _EDIT_STS, ...rest } = r;
        return { ...rest, rowStatus: "I", MENU_CD: MENU_CODE };
      }),
    );
  },
};
