import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./IfMaterial";

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

export const ifMaterialApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/ifMaterialService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  searchPlant(payload: any) {
    return apiClient.post<CommonResponse>(
      "/ifMaterialService/searchPlant",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  searchSales(payload: any) {
    return apiClient.post<CommonResponse>(
      "/ifMaterialService/searchSales",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  searchUom(payload: any) {
    return apiClient.post<CommonResponse>(
      "/ifMaterialService/searchUom",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  reprocess(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/ifMaterialService/reprocess",
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
