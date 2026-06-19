import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CD } from "./TenderReceiveDispatch";

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

export const chgVehicleApi = {
  getDedTruckList(payload: any) {
    return apiClient.post<commonResponse>(
      "/dispatchPlanService/searchDispatchChangeVehiclePop",
      withSession({ MENU_CD, ...payload }),
    );
  },

  getConTruckList(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/searchVehicleChgPop",
      withSession({ MENU_CD, ...payload }),
    );
  },
};
