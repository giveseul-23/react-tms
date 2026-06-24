import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { AUTH, MENU_CODE } from "./ApMonthlyManagement";

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

export const apMonthlyManagementApi = {
  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // Dynamic charge columns for monthly AP.
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

  getApMonthlyDate(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/getApMonthlyDate`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  createMonthlyAp(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/createMonthlyAp`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // Cancel monthly AP.
  cancelMonthlyResult(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/cancelMonthlyAp`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // Manual rate excel upload and template download.
  uploadManualRate(file: File, params: any) {
    return postUpload(`/apMonthlyManagementService/uploadManualRate`, file, params);
  },

  downloadManualRatePrepare(payload: any) {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/downloadManualRatePrepare`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  downloadManualRate() {
    return apiClient.get(`/apDailyManagementService/downloadRate`, {
      params: sessionParams({ MENU_CD: AUTH.grids.main }),
      responseType: "blob",
    });
  },

  // Toll rate aggregation and cancel actions. Hidden in the Sencha toolbar.
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

  save: (payload: any) => {
    return dsSavePost(`/apMonthlyManagementService/save`, payload.dsSave);
  },

  // Monthly AP confirm and confirm cancel.
  confirm: (payload: any) => {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/updateMonthlyApConfirm`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  cancelConfirm: (payload: any) => {
    return apiClient.post<commonResponse>(
      `/apMonthlyManagementService/updateMonthlyApConfirmCancel`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
