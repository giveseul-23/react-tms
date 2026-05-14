import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CD } from "./Country";

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
  getCountryList(payload: any) {
    return apiClient.post<commonResponse>(
      `/countryService/search`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  saveCountryList(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<commonResponse>(
      `/countryService/save`,
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

  getStateList(payload: any) {
    return apiClient.post<commonResponse>(
      "/countryService/searchStateInfoList",
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  saveStateList(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<commonResponse>(
      `/countryService/saveStateInfo`,
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

  getCityList(payload: any) {
    return apiClient.post<commonResponse>(
      "/countryService/searchCityInfoList",
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  saveCityList(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<commonResponse>(
      `/countryService/saveCityInfo`,
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

  getZipList(payload: any) {
    return apiClient.post<commonResponse>(
      "/countryService/searchPostFormatList",
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  saveZipList(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<commonResponse>(
      `/countryService/saveZipMskInfo`,
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
