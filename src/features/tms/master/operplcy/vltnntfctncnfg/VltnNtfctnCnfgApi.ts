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

export const vltnNtfctnCnfgApi = {
  MENU_CD: "MENU_VLTN_NTFCTN_CNFG",
  ////// SEARCH
  getVltnNtfctnCnfgList(payload: any) {
    return apiClient.post<commonResponse>(
      `/vltnNtfctnCnfgService/searchLgst`,
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },

  getVltnNtfctnCnfgDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      "/vltnNtfctnCnfgService/searchCnfg",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },
  getVltnNtfctnCnfgChannelList(payload: any) {
    return apiClient.post<commonResponse>(
      "/vltnNtfctnCnfgService/searchChnl",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },
  getVltnNtfctnCnfgTargetList(payload: any) {
    return apiClient.post<commonResponse>(
      "/vltnNtfctnCnfgService/searchRcvr",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },
};
