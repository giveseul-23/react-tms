import { apiClient } from "@/app/api/client";

type commonResponse = {
  rows: [];
};

// ✅ 공통 payload 주입 헬퍼
const withSession = (payload: any = {}) => {
  const userId = sessionStorage.getItem("userId");
  const ACCESS_TOKEN = sessionStorage.getItem("ACCESS_TOKEN");
  const REFRESH_TOKEN = sessionStorage.getItem("REFRESH_TOKEN");

  return {
    userId,
    sesUserId: userId,
    ACCESS_TOKEN,
    REFRESH_TOKEN,
    ...payload,
  };
};

export const chgVehicleApi = {
  ////// SEARCH
  getDedTruckList(payload: any) {
    return apiClient.post<commonResponse>(
      `/openapina/carrier/getDedTruckList`,
      withSession(payload),
    );
  },

  getConTruckList(payload: any) {
    return apiClient.post<commonResponse>(
      `/openapina/carrier/getConTruckList`,
      withSession(payload),
    );
  },
};
