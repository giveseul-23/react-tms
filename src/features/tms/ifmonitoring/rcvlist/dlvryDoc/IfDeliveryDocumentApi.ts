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

export const ifDeliveryDocumentApi = {
  MENU_CD: "MENU_IF_RCV_DLVRY_DOC",

  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/ifDeliveryDocumentService/searchList`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  getDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      `/ifDeliveryDocumentService/searchDetail`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  reprocess(payload: any) {
    return apiClient.post<commonResponse>(
      `/ifDeliveryDocumentService/reprocess`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },
};
