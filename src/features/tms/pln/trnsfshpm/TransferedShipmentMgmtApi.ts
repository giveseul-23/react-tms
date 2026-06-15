import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./TransferedShipmentMgmt";

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

export const transferedShipmentMgmtApi = {
  search(payload: any) {
    return apiClient.post<CommonResponse>(
      `/transferedShipmentService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  searchReceive(payload: any) {
    return apiClient.post<CommonResponse>(
      `/transferedShipmentService/searchRecive`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  searchDetail(payload: any) {
    return apiClient.post<CommonResponse>(
      `/transferedShipmentService/searchDetail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  searchTrnfShpmPop(payload: any) {
    return apiClient.post<CommonResponse>(
      `/transferedShipmentService/searchTrnfShpmPop`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
