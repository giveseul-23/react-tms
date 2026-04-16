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

export const currencyApi = {
  ////// SEARCH
  getCurrencyList(menuCd: string, payload: any) {
    return apiClient.post<commonResponse>(
      `/currencyService/search`,
      withSession({ MENU_CD: menuCd, ...payload }),
    );
  },
};
