import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./ConfirmDispatch";

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

export const confirmDispatchApi = {
  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/searchConfirmDispatch`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getShipmentList(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/searchConfirmDispatchShipment`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getShipmentDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/searchConfirmDispatchShipmentDetail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getPodList(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/searchPodByDspchNo`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getPodEventLogList(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/searchPodEventLogByDspchNo`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getAssignAssistList(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/searchAssignAssist`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getUnassignAssistList(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/searchUnassignAssist`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getDockList(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/searchDock`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 액션 버튼
  startArrival(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/startArrival`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  requestInbound(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/requestInbound`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  changeVehicle(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/changeVehicle`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  confirmDispatch(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/confirmDispatch`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  cancelConfirmDispatch(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/cancelConfirmDispatch`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  requestInboundDocument(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/requestInboundDocument`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  issueReceipt(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/issueReceipt`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  inputActual(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/inputActual`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
