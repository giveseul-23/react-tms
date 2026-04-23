import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";

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

export const departArrivalManagementApi = {
  MENU_CD: "MENU_EVENT_MANAGER",

  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/searchDepartArrivalManagement`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 경유처
  getStopoverList(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/searchDepartArrivalManagementStop`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 할당주문
  getAssignedOrderList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchPlanService/searchAssignedShipment`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 할당주문 상세(품목)
  getAssignedOrderDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchPlanService/searchAssignedShipmentDetail`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  inquireReceipt(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/inquireReceipt`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  controlRoute(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/controlRoute`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  startLoading(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/startLoading`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  startTransport(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/startTransport`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  cancelTransport(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/cancelTransport`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  cancelDeliveryComplete(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/cancelDeliveryComplete`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  completeTransport(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/completeTransport`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  resetDispatch(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/resetDispatch`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  save(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/save`,
      withSession(rows),
    );
  },

  saveStopover(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/saveStopover`,
      withSession(rows),
    );
  },

  confirmPBoxRecovery(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/confirmPBoxRecovery`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
};
