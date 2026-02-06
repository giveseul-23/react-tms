import { apiClient } from "@/app/api/client";

export const tenderApi = {
  getDispatchList(payload: any) {
    return apiClient.post("/tender/dispatch/list", payload);
  },

  getDispatchDetail(dispatchNo: string) {
    return apiClient.get(`/tender/dispatch/${dispatchNo}`);
  },

  saveDispatch(payload: any) {
    return apiClient.post("/tender/dispatch/save", payload);
  },
};
