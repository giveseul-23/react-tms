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

export const distanceTransitTimeApi = {
  MENU_CD: "MENU_DTTO_MGMT",

  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/distanceTransitTimeService/search`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  getHistoryList(payload: any) {
    return apiClient.post<commonResponse>(
      `/distanceTransitTimeService/searchAdd`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  calculateWithMoveDistance(payload: any) {
    return apiClient.post<commonResponse>(
      `/distanceTransitTimeService/calculateWithMoveDistance`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  calculateWithoutMoveDistance(payload: any) {
    return apiClient.post<commonResponse>(
      `/distanceTransitTimeService/calculateWithoutMoveDistance`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  applyMoveDistance(payload: any) {
    return apiClient.post<commonResponse>(
      `/distanceTransitTimeService/applyMoveDistance`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  changeRouteOption(payload: any) {
    return apiClient.post<commonResponse>(
      `/distanceTransitTimeService/changeRouteOption`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  save(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/distanceTransitTimeService/save`,
      withSession(rows),
    );
  },

  saveHistory(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/distanceTransitTimeService/saveHistory`,
      withSession(rows),
    );
  },
};
