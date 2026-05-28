import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CD } from "./LanguagePack";

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

export const langPackApi = {
  ////// SEARCH
  getLangPackList(payload: any) {
    return apiClient.post<commonResponse>(
      `/languagePackService/search`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  /**
   * 다국어 저장 — menuConfig 와 동일한 패턴 (ExtJS Ext.Ajax.request 의 params/jsonData 분리):
   *   - URL 쿼리 (axios `params`) → 서버 PARAM_MAP (세션 + 기타)
   *   - JSON body                   → valueChainData.map.dsSave (List<row>)
   */
  saveLangPack(payload: any) {
    const { dsSave, ...rest } = payload ?? {};

    return apiClient.post(
      `/languagePackService/save`,
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          MENU_CD,
          ...rest,
        },
      },
    );
  },
};
