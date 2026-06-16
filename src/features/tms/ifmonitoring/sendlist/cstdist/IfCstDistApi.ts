import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./IfCstDist";

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

export const ifCstDistApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/ifCostDistributionService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  searchDtl(payload: any) {
    return apiClient.post<CommonResponse>(
      "/ifCostDistributionService/searchDtl",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
