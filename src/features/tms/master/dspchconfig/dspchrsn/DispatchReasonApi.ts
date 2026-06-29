import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./DispatchReason";

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

const saveParams = (rest: any) => ({
  params: {
    ...getSessionFields(),
    MENU_CD: MENU_CODE,
    ...rest,
  },
});

export const dispatchReasonApi = {
  ////// SEARCH
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dispatchReasonService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getDetailList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dispatchReasonService/searchDetail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  ////// SAVE
  saveMain(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      `/dispatchReasonService/saveMain`,
      { dsSave },
      saveParams(rest),
    );
  },

  saveDetail(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      `/dispatchReasonService/saveDetail`,
      { dsSave },
      saveParams(rest),
    );
  },
};
