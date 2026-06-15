import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./ReceiveShipmentManagement";

type CommonResponse = {
  data?: {
    dsOut?: any[];
  };
  result?: any[];
};

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();
  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }
  return { ...sessionFields, ...payload };
};

export const receiveShipmentManagementApi = {
  search(payload: any) {
    return apiClient.post<CommonResponse>(
      "/receiveShipmentManagementService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  searchDetail(payload: any) {
    return apiClient.post<CommonResponse>(
      "/receiveShipmentManagementService/searchDetail",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  searchLocationAddressPop(payload: any) {
    return apiClient.post<CommonResponse>(
      "/receiveShipmentManagementService/searchLocationAddressPop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  saveShipment(payload: any) {
    return apiClient.post<CommonResponse>(
      "/receiveShipmentManagementService/saveShipment",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  saveShipmentDetail(payload: any) {
    return apiClient.post<CommonResponse>(
      "/receiveShipmentManagementService/saveShipmentDetail",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  saveShipmentCancel(payload: any) {
    return apiClient.post<CommonResponse>(
      "/receiveShipmentManagementService/saveShipmentCancel",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  saveShipmentPlanId(payload: any) {
    return apiClient.post<CommonResponse>(
      "/receiveShipmentManagementService/saveShipmentPlanId",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  saveShipmentPlanIdCancel(payload: any) {
    return apiClient.post<CommonResponse>(
      "/receiveShipmentManagementService/saveShipmentPlanIdCancel",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  saveShipmentTransfer(payload: any) {
    return apiClient.post<CommonResponse>(
      "/receiveShipmentManagementService/saveShipmentTransfer",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  saveBatchCreation(payload: any) {
    return apiClient.post<CommonResponse>(
      "/receiveShipmentManagementService/saveBatchCreation",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};