import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./VltnNtfctnCnfg";

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
  ////// SEARCH
  getVltnNtfctnCnfgList(payload: any) {
    return apiClient.post<commonResponse>(
      `/vltnNtfctnCnfgService/searchLgst`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  getVltnNtfctnCnfgDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      "/vltnNtfctnCnfgService/searchCnfg",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },
  getVltnNtfctnCnfgChannelList(payload: any) {
    return apiClient.post<commonResponse>(
      "/vltnNtfctnCnfgService/searchChnl",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },
  getVltnNtfctnCnfgTargetList(payload: any) {
    return apiClient.post<commonResponse>(
      "/vltnNtfctnCnfgService/searchRcvr",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },
};
