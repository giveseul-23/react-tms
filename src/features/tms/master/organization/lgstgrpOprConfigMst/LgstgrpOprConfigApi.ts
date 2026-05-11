// src/app/services/lgstgrpOprConfig/lgstgrpOprConfigApi.ts
import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./LgstgrpOprConfigMst";

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

export const lgstgrpOprConfigApi = {
  // ── 설정유형 탭 목록 조회 ────────────────────────────────────────
  getConfigTypeList() {
    return apiClient.post<CommonResponse>(
      "/lgstGrpConfigMasterService/searchConfigType",
      withSession({ MENU_CD: MENU_CODE }),
    );
  },

  // ── 플류운영그룹운영설정 (Top-left) ──────────────────────────────
  getConfigList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/lgstGrpConfigMasterService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  saveConfig(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/lgstGrpConfigMasterService/save",
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          MENU_CD: MENU_CODE,
          ...rest,
        },
      },
    );
  },

  syncConfig(payload: any) {
    return apiClient.post<CommonResponse>(
      "/lgstGrpConfigMasterService/syncConfig",
      withSession(payload),
    );
  },

  // ── 설정상세 (Top-right) ─────────────────────────────────────────
  getConfigDetailList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/lgstGrpConfigMasterService/searchDetail",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  saveConfigDetail(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/lgstGrpConfigMasterService/saveDetail",
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          MENU_CD: MENU_CODE,
          ...rest,
        },
      },
    );
  },

  // ── 설정코드다국어설정 (Bottom-left) ─────────────────────────────
  getConfigI18nList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/lgstGrpConfigMasterService/searchLang",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  saveConfigI18n(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/lgstGrpConfigMasterService/saveLang",
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          MENU_CD: MENU_CODE,
          ...rest,
        },
      },
    );
  },

  // ── 설정상세코드다국어설정 (Bottom-right) ────────────────────────
  getConfigDetailI18nList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/lgstGrpConfigMasterService/searchDetailLang",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  saveConfigDetailI18n(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/lgstGrpConfigMasterService/saveDetailLang",
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          MENU_CD: MENU_CODE,
          ...rest,
        },
      },
    );
  },
};
