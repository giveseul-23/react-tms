import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./TariffChargeService";

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

export const tariffChargeServiceApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/tariffChargeService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  save(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      `/tariffChargeService/save`,
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
