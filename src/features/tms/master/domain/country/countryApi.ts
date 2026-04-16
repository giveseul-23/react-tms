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

export const countryApi = {
  ////// SEARCH
  getCountryList(menuCd: string, payload: any) {
    return apiClient.post<commonResponse>(
      `/countryService/search`,
      withSession({ MENU_CD: menuCd, ...payload }),
    );
  },

  getStateList(menuCd: string, payload: any) {
    return apiClient.post<commonResponse>(
      "/countryService/searchStateInfoList",
      withSession({ MENU_CD: menuCd, ...payload }),
    );
  },

  getZipList(menuCd: string, payload: any) {
    return apiClient.post<commonResponse>(
      "/countryService/searchPostFormatList",
      withSession({ MENU_CD: menuCd, ...payload }),
    );
  },

  getCityList(menuCd: string, payload: any) {
    return apiClient.post<commonResponse>(
      "/countryService/searchCityInfoList",
      withSession({ MENU_CD: menuCd, ...payload }),
    );
  },
};
