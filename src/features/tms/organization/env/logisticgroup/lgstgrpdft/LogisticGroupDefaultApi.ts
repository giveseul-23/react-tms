import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";

type commonResponse = {
  rows: [];
};

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();

  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }

  return { ...sessionFields, ...payload };
};

export const logisticGroupDefaultApi = {
  MENU_CD: "MENU_ORGANIZATION_ENV_LGST_GRP_DFT",
  ////// SEARCH
  getLgstDefaultCnfgGrpList(payload: any) {
    return apiClient.post<commonResponse>(
      `/logisticGroupDefaultService/search`,
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },

  getLgstDefaultCnfgList(payload: any) {
    return apiClient.post<commonResponse>(
      "/logisticGroupDefaultService/searchCnfg",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },

  getLgstDefaultDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      "/logisticGroupDefaultService/searchCnfgDtl",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },
};
