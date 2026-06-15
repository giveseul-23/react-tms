import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./IfCarrier";

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

export const ifCarrierApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/ifCarrierService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  searchBank(payload: any) {
    return apiClient.post<CommonResponse>(
      "/ifCarrierService/searchBank",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  searchComp(payload: any) {
    return apiClient.post<CommonResponse>(
      "/ifCarrierService/searchComp",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  reprocess(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/ifCarrierService/reprocess",
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
