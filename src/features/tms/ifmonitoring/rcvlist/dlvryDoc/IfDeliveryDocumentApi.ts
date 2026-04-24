import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./IfDeliveryDocument";

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
  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/ifDeliveryDocumentService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      `/ifDeliveryDocumentService/searchInterfaceDetail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  reprocess(payload: any) {
    return apiClient.post<commonResponse>(
      `/ifDeliveryDocumentService/reprocess`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
