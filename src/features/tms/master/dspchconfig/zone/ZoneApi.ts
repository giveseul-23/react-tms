import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./Zone";

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

export const zoneApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/zoneService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getZoneCodeList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/zoneService/searchZoneCode",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getZoneCodeDetailList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/zoneService/searchZoneCodeDetail",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getZoneCodeLocationList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/zoneService/searchZoneCodeLocation",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  searchItineraryLocationPop(payload: any) {
    return apiClient.post<CommonResponse>(
      "/itineraryService/searchItineraryLocationPop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  saveZoneCode(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/zoneService/saveZoneCode",
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

  saveZoneCodeDetail(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/zoneService/saveZoneCodeDetail",
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

  saveZoneLocation(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    const mapped = (Array.isArray(dsSave) ? dsSave : []).map((row: any) => ({
      ...row,
      deleteYn: row.rowStatus === "D" ? "Y" : "N",
    }));
    return apiClient.post<CommonResponse>(
      "/zoneService/saveZoneLocation",
      { dsSave: mapped },
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
