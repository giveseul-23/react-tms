import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./OilPrice";

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

export const oilPriceApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/oilPriceService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getDfOil(payload: any) {
    return apiClient.post<CommonResponse>(
      `/oilPriceService/searchDfOil`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getMonth(payload: any) {
    return apiClient.post<CommonResponse>(
      `/oilPriceService/searchMonth`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  saveDfOil(payload: { dsSave: any[] }) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      `/oilPriceService/saveDfOil`,
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
