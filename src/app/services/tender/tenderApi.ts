import { apiClient } from "@/app/api/client";

type commonResponse = {
  rows: [];
};

export const tenderApi = {
  getDispatchList(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/getDspchList",
      payload,
    );
  },

  getDispatchDetail(dispatchNo: string) {
    return apiClient.get(`/tender/dispatch/${dispatchNo}`);
  },

  saveDispatch(payload: any) {
    return apiClient.post("/tender/dispatch/save", payload);
  },
};
