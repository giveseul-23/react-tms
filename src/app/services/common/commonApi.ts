import { apiClient } from "@/app/api/client";
import { Hash } from "lucide-react";
export type commonRequest = {
  sesUserId: string;
  userId: string;
  sqlProp: string;
  ACCESS_TOKEN: string;
};

export type comboOptRequest = {
  sesUserId: string;
  userId: string;
  sqlProp: string;
  keyParam: string;
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

  fetchComboOptions(payload: comboOptRequest[]) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/fetchComboOptions",
      payload,
    );
  },
};
