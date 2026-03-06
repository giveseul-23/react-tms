import { apiClient } from "@/app/api/client";

type commonResponse = {
  rows: [];
};

export const chgVehicleApi = {
  ////// SEARCH
  getDedTruckList(payload: any) {
    return apiClient.post<commonResponse>(
      `/openapina/carrier/getDedTruckList`,
      payload,
    );
  },
};
