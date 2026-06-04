import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./FuelEfficiency";

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

export const fuelEfficiencyApi = {
  getList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/fuelEfficiencyService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getLgstList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/fuelEfficiencyService/searchLgst",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getVehTpList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/fuelEfficiencyService/searchVehTp",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  save(payload: { dsSave: any[] }) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/fuelEfficiencyService/save",
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

  saveVehTp(payload: { dsSave: any[] }) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/fuelEfficiencyService/saveVehTp",
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

  addCopy(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/fuelEfficiencyService/addCopy",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
