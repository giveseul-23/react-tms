import { apiClient } from "@/app/api/client";
export type commonRequest = {
  sesUserId: string;
  userId: string;
  sqlProp: string;
  ACCESS_TOKEN: string;
};

export type commonResponse = {
  rows: [];
};

export const commonApi = {
  getCodesAndNames(payload: commonRequest) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/getCodeAndNames",
      payload,
    );
  },
};
