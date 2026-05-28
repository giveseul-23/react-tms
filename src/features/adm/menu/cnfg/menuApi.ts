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

  getMsgCodeName(payload: any) {
    return apiClient.post<commonResponse>(
      `/menuService/selectMsgCodeName`,
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

  /**
   * 메뉴 저장 — ExtJS Ext.Ajax.request 의 { params, jsonData } 분리 패턴과 동일하게:
   *   - URL 쿼리스트링 (axios `params`)  → 서버 PARAM_MAP 으로 매핑
   *   - JSON body (axios 두번째 인자)      → 서버 valueChainData.map 의 최상위 키로 매핑 (dsSave 가 여기로)
   */
  saveMenuConfig(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post(
      `/menuService/saveWithReact`,
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          MENU_CD: MENU_CD,
          ...rest,
        },
      },
    );
  },
};
