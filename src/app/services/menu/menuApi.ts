// src/app/services/menu/menuApi.ts
import { apiClient } from "@/app/api/client";
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

export const menuApi = {
  getMenuConfigList(payload: any) {
    return apiClient.post<commonResponse>(
      `/openapina/carrier/getMenuConfigList`,
      withSession(payload),
    );
  },

  /** 메뉴경로(폴더) 추가 — LEAFYN = "N" */
  insertMenuFolder(payload: any) {
    return apiClient.post(
      `/openapina/carrier/insertMenuFolder`,
      withSession(payload),
    );
  },

  /** 메뉴(화면) 추가 — LEAFYN = "Y" */
  insertMenuItem(payload: any) {
    return apiClient.post(
      `/openapina/carrier/insertMenuItem`,
      withSession(payload),
    );
  },

  /** 메뉴 저장 (수정된 행 일괄 저장) */
  saveMenuConfig(payload: any[]) {
    return apiClient.post(
      `/openapina/carrier/saveMenuConfig`,
      withSession(payload),
    );
  },
};
