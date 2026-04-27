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

export const langPackApi = {
  ////// SEARCH
  getLangPackList(menuCd: string, payload: any) {
    return apiClient.post<commonResponse>(
      `/languagePackService/search`,
      withSession({ MENU_CD: menuCd, ...payload }),
    );
  },

  ////// SAVE
  saveLangPack(rows: any[]) {
    return apiClient.post(`/langPackService/save`, withSession(rows));
  },
};
