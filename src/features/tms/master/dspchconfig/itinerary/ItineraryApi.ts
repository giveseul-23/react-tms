import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./Itinerary";

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

export const itineraryApi = {
  getList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/itineraryService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getDetailList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/itineraryService/searchDetail",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  searchItineraryLocationPop(payload: Record<string, unknown>) {
    const body = { ...payload };
    if (Array.isArray(body.NOT_LOC_LST)) {
      body.NOT_LOC_LST = body.NOT_LOC_LST;
    }
    return apiClient.post<CommonResponse>(
      "/itineraryService/searchItineraryLocationPop",
      withSession({ MENU_CD: MENU_CODE, ...body }),
    );
  },

  searchGroupPop(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/itineraryService/searchGroupPop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  /** ItineraryVehPop — vehicleService/searchVehiclePop (레거시 ItineraryVehPop) */
  searchVehiclePop(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/vehicleService/searchVehiclePop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  save(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/itineraryService/save",
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

  saveDetail(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/itineraryService/saveDetail",
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

  setItineraryGroup(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/itineraryService/setItineraryGroup",
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
