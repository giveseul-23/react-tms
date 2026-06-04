// src/app/services/lgstgrpOprConfig/lgstgrpOprConfigApi.ts
import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CD } from "./AccountReceivableChargeManagement";

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

export const AccountReceivableChargeManagementApi = {
  getArChargeList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/accountReceivableChargeManagementService/search",
      withSession({ MENU_CD: MENU_CD}),
    );
  },

  saveArCharge(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/accountReceivableChargeManagementService/save",
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

  getArChargeDetail(payload: any) {
    return apiClient.post<CommonResponse>(
      "/accountReceivableChargeManagementService/searchSub01",
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },


};
