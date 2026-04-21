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

export const confirmDispatchApi = {
  MENU_CD: "MENU_ASSIGN_CONFIRM",

  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/searchList`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  getOrderList(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/searchOrder`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  getOrderItemList(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/searchOrderItem`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  getReceiptList(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/searchReceipt`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  getReceiptHistoryList(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/searchReceiptHistory`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 액션 버튼
  startArrival(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/startArrival`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  requestInbound(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/requestInbound`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  changeVehicle(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/changeVehicle`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  confirmDispatch(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/confirmDispatch`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  cancelConfirmDispatch(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/cancelConfirmDispatch`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  requestInboundDocument(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/requestInboundDocument`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  issueReceipt(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/issueReceipt`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
  inputActual(payload: any) {
    return apiClient.post<commonResponse>(
      `/confirmDispatchService/inputActual`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
};
