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

const postDsSave = (url: string, payload: any = {}) => {
  const { dsSave, ...rest } = payload ?? {};
  return apiClient.post<CommonResponse>(
    url,
    { dsSave },
    {
      params: {
        ...getSessionFields(),
        MENU_CD: MENU_CODE,
        ...rest,
      },
    },
  );
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
    return postDsSave("/receiveShipmentManagementService/saveShipment", payload);
  },
  saveShipmentDetail(payload: any) {
    return postDsSave(
      "/receiveShipmentManagementService/saveShipmentDetail",
      payload,
    );
  },
  saveShipmentCancel(payload: any) {
    return postDsSave(
      "/receiveShipmentManagementService/saveShipmentCancel",
      payload,
    );
  },
  saveShipmentPlanId(payload: any) {
    return postDsSave(
      "/receiveShipmentManagementService/saveShipmentPlanId",
      payload,
    );
  },
  saveShipmentPlanIdCancel(payload: any) {
    return postDsSave(
      "/receiveShipmentManagementService/saveShipmentPlanIdCancel",
      payload,
    );
  },
  saveShipmentTransfer(payload: any) {
    return postDsSave(
      "/receiveShipmentManagementService/saveShipmentTransfer",
      payload,
    );
  },
  saveBatchCreation(payload: any) {
    return apiClient.post<CommonResponse>(
      "/receiveShipmentManagementService/saveBatchCreation",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
