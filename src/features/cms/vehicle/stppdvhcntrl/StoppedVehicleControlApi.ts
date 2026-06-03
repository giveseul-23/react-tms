import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./StoppedVehicleControl";

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

export const stoppedVehicleControlApi = {
  // 차량멈춤 메인 조회
  getMainList(payload: any) {
    return apiClient.post<commonResponse>(
      `/stoppedVehicleControlService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getSub01List(payload: any) {
    return apiClient.post<commonResponse>(
      "/stoppedVehicleControlService/searchTotal",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },  

  getSub02List(payload: any) {
    return apiClient.post<commonResponse>(
      "/stoppedVehicleControlService/searchDetail",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },   

  // 상세내역 조회
  getSub03List(payload: any) {
    return apiClient.post<commonResponse>(
      `/stoppedVehicleControlService/searchDetailByVehicle`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
