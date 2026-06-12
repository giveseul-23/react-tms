import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./UnassignedShipmentMgmt";

type CommonResponse = {
  rows: [];
};

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();
  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }
  return { ...sessionFields, ...payload };
};

export const unassignedShipmentMgmtApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/unassignedShipmentMgmtService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
