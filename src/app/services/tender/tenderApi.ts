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

  getDispatchStopList(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/getDspchStopList",
      payload,
    );
  },

  getDispatchSmsHisList(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/getDispatchSmsHisList",
      payload,
    );
  },

  getDispatchApSetlList(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/getDispatchApSetlList",
      payload,
    );
  },
};
