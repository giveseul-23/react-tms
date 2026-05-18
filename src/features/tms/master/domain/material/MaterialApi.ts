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

export const materialApi = {
  getList(menuCd: string, payload: Record<string, unknown>) {
    return apiClient.post<commonResponse>(
      "/materialService/search",
      withSession({ MENU_CD: menuCd, ...payload }),
    );
  },

  getDetailList(menuCd: string, payload: Record<string, unknown>) {
    return apiClient.post<commonResponse>(
      "/materialService/searchDetail",
      withSession({ MENU_CD: menuCd, ...payload }),
    );
  },

  getUomList(menuCd: string, payload: Record<string, unknown>) {
    return apiClient.post<commonResponse>(
      "/materialService/searchUom",
      withSession({ MENU_CD: menuCd, ...payload }),
    );
  },
};
