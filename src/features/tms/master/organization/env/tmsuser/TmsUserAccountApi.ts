import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./TmsUserAccount";

type CommonResponse = {
  rows: [];
};

const withSession = (payload: Record<string, unknown> = {}) => ({
  ...getSessionFields(),
  MENU_CD: MENU_CODE,
  ...payload,
});

const postDsSave = (url: string, payload: { dsSave: any[] }) =>
  apiClient.post<CommonResponse>(
    url,
    { dsSave: payload.dsSave },
    {
      params: {
        ...getSessionFields(),
        MENU_CD: MENU_CODE,
      },
    },
  );

export const tmsUserAccountApi = {
  getList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/tmsUserAccountService/search",
      withSession(payload),
    );
  },
  getUserDivList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/tmsUserAccountService/searchUserDiv",
      withSession(payload),
    );
  },
  getUserLgstGrpList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/tmsUserAccountService/searchUserLgstGrp",
      withSession(payload),
    );
  },
  getUserLocList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/tmsUserAccountService/searchUserLoc",
      withSession(payload),
    );
  },
  getUserPopupList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/tmsUserAccountService/searchTmsUserAccountPop",
      withSession(payload),
    );
  },
  save(payload: { dsSave: any[] }) {
    return postDsSave("/tmsUserAccountService/save", payload);
  },
  saveUserDiv(payload: { dsSave: any[] }) {
    return postDsSave("/tmsUserAccountService/saveUserDiv", payload);
  },
  saveUserLgstGrp(payload: { dsSave: any[] }) {
    return postDsSave("/tmsUserAccountService/saveUserLgstGrp", payload);
  },
  saveUserLoc(payload: { dsSave: any[] }) {
    return postDsSave("/tmsUserAccountService/saveUserLoc", payload);
  },
  initPasswd(payload: { dsSave: any[] }) {
    return postDsSave("/tmsUserAccountService/initPasswd", payload);
  },
};
