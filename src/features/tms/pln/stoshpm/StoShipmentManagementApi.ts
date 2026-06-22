import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./StoShipmentManagement";

type CommonResponse = {
  data?: {
    dsOut?: any[];
  };
  result?: any[];
  rows?: [];
};

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();
  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }
  return { ...sessionFields, ...payload };
};

const postDsSave = (url: string, payload: any = {}) => {
  const { dsSave, ...rest } = payload ?? {};
  return apiClient.post<CommonResponse>(
    url,
    { dsSave },
    {
      params: {
        ...getSessionFields(),
        MENU_CD: MENU_CODE,
        ...rest,
      },
    },
  );
};

export const stoShipmentManagementApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/stoShipmentManagementService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  save(payload: any) {
    return postDsSave("/stoShipmentManagementService/save", payload);
  },

  searchLocPlantPop(payload: any) {
    return apiClient.post<CommonResponse>(
      "/stoShipmentManagementService/searchLocPlantPop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getPlantTcd(payload: any) {
    return apiClient.post<CommonResponse>(
      "/stoShipmentManagementService/getPlantTcd",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
