import { apiClient } from "@/app/http/client";
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

export const divisionConfigMasterApi = {
  MENU_CD: "MENU_DIV_OPR_CONFIG_MST",

  // ── 설정유형 탭 목록 조회 ────────────────────────────────────────
  getConfigTypeList() {
    return apiClient.post<CommonResponse>(
      "/divisionConfigMasterService/search",
      withSession({ MENU_CD: this.MENU_CD }),
    );
  },

  // ── 플류운영그룹운영설정 (Top-left) ──────────────────────────────
  getConfigList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/divisionConfigMasterService/search",
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  saveConfig(payload: any) {
    return apiClient.post<CommonResponse>(
      "/divisionConfigMasterService/saveConfig",
      withSession(payload),
    );
  },

  syncConfig(payload: any) {
    return apiClient.post<CommonResponse>(
      "/divisionConfigMasterService/syncConfig",
      withSession(payload),
    );
  },

  // ── 설정상세 (Top-right) ─────────────────────────────────────────
  getConfigDetailList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/divisionConfigMasterService/searchDetail",
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  saveConfigDetail(payload: any) {
    return apiClient.post<CommonResponse>(
      "/divisionConfigMasterService/saveConfigDetail",
      withSession(payload),
    );
  },

  // ── 설정코드다국어설정 (Bottom-left) ─────────────────────────────
  getConfigI18nList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/divisionConfigMasterService/searchLang",
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  saveConfigI18n(payload: any) {
    return apiClient.post<CommonResponse>(
      "/divisionConfigMasterService/saveConfigI18n",
      withSession(payload),
    );
  },

  // ── 설정상세코드다국어설정 (Bottom-right) ────────────────────────
  getConfigDetailI18nList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/divisionConfigMasterService/searchDetailLang",
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  saveConfigDetailI18n(payload: any) {
    return apiClient.post<CommonResponse>(
      "/divisionConfigMasterService/saveConfigDetailI18n",
      withSession(payload),
    );
  },
};
