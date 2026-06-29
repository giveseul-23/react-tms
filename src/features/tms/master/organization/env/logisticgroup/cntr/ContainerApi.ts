import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./Container";

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

export const containerApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/organizationService/searchLgstGrp",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getDetailList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/organizationService/searchLgstGrpCntr",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  save(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/organizationService/saveLgstCntr",
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
