import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CD } from "./UserPlan";

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

export const userPlanApi = {
  ////// SEARCH
  getUserPlanList(menuCd: string, payload: any) {
    return apiClient.post<commonResponse>(
      `/userplanService/search`,
      withSession({ MENU_CD: menuCd, ...payload }),
    );
  },

  searchApprovedUser(payload: any) {
    return apiClient.post<commonResponse>(
      `/userplanService/searchApprovedUser`,
      withSession({ MENU_CD, ...payload }),
    );
  },

  searchPlanId(payload: any) {
    return apiClient.post<commonResponse>(
      `/userplanService/searchPlanId`,
      withSession({ MENU_CD, ...payload }),
    );
  },

  ////// SAVE
  save(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<commonResponse>(
      `/userplanService/save`,
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          MENU_CD,
          ...rest,
        },
      },
    );
  },
};
