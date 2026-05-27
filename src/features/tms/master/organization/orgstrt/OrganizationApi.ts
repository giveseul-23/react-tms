// src/app/services/lgstgrpOprConfig/lgstgrpOprConfigApi.ts
import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CD } from "./Organization";

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

export const OrganizationApi = {
  getDivisionList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/organizationService/search",
      withSession({ MENU_CD: MENU_CD}),
    );
  },

  saveDivision(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/organizationService/save",
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

  getLogisticsList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/organizationService/searchLgstGrp",
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  saveLogistics(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/organizationService/saveLgstGrp",
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
