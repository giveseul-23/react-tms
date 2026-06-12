import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./Charge";

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

export const chargeApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/chargeService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getCalcformulList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/chargeService/searchCalcformulInfoList",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  save(payload: { dsSave: any[] }) {
    return apiClient.post<CommonResponse>(
      "/chargeService/save",
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },

  saveCalcformul(payload: { dsSave: any[] }) {
    return apiClient.post<CommonResponse>(
      "/chargeService/saveCalcformulInfo",
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },

  searchTariffPopup(menuCode: string, payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/tariffService/search",
      withSession({ MENU_CD: menuCode, POP_FLAG: "Y", ...payload }),
    );
  },
};
