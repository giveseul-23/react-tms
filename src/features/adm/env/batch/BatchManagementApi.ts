import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";

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

export const batchManagementApi = {
  getBatchManagementList(menuCd: string, payload: any) {
    return apiClient.post<CommonResponse>(
      "/batchManagementService/search",
      withSession({
        MENU_CD: menuCd,
        ...payload,
      }),
    );
  },

  getBatchTriggerList(menuCd: string, payload: any) {
    return apiClient.post<CommonResponse>(
      "/batchManagementService/searchTrigger",
      withSession({
        MENU_CD: menuCd,
        ...payload,
      }),
    );
  },

  getBatchHistoryList(menuCd: string, payload: any) {
    return apiClient.post<CommonResponse>(
      "/batchManagementService/searchHistory",
      withSession({
        MENU_CD: menuCd,
        ...payload,
      }),
    );
  },

  saveBatchManagement(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post(
      "/batchManagementService/save",
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          ...rest,
        },
      },
    );
  },

  saveBatchTrigger(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post(
      "/batchManagementService/saveTrigger",
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          ...rest,
        },
      },
    );
  },

  executeBatch(payload: any) {
    return apiClient.post(
      "/batchManagementService/exeBatch",
      withSession(payload),
    );
  },
};
