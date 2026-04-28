// src/app/services/menu/menuApi.ts
import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CD } from "./MenuConfig";

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
      `/menuService/searchByReact`,
      withSession({
        MENU_CD: MENU_CD,
        ...payload,
      }),
    );
  },

  /** 메뉴경로(폴더) 추가 — LEAFYN = "N" */
  insertMenuFolder(payload: any) {
    return apiClient.post(
      `/menuService/insertMenuFolder`,
      withSession({
        MENU_CD: MENU_CD,
        ...payload,
      }),
    );
  },

  /** 메뉴(화면) 추가 — LEAFYN = "Y" */
  insertMenuItem(payload: any) {
    return apiClient.post(
      `/menuService/insertMenuItem`,
      withSession({
        MENU_CD: MENU_CD,
        ...payload,
      }),
    );
  },

  /** 메뉴 저장 (수정된 행 일괄 저장) */
  saveMenuConfig(payload: any[]) {
    return apiClient.post(
      `/menuService/save`,
      withSession({
        MENU_CD: MENU_CD,
        ...payload,
      }),
    );
  },
};
