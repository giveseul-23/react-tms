import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./Driver";

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

export const driverApi = {
  getList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/driverService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getCustList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/driverService/searchDrvrCustList",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  save(payload: { dsSave: any[] }) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/driverService/save",
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

  saveDetail(payload: { dsSave: any[] }) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/driverService/saveDetail",
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

  initPasswd(payload: { dsSave: any[] }) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/driverService/initPasswd",
      { dsSave: withSession(dsSave) },
      {
        params: {
          ...getSessionFields(),
          MENU_CD: MENU_CODE,
          ...rest,
        },
      },
    );
  },

  searchDrvrPhnNo(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/driverService/searchDrvrPhnNo",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  searchDrvrPhnNoOne(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/driverService/searchDrvrPhnNoOne",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
