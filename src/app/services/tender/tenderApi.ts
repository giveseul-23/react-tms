import { apiClient } from "@/app/api/client";
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

export const tenderApi = {
  ////// SEARCH
  getDispatchList(payload: any) {
    return apiClient.post<commonResponse>(
      `/openapina/carrier/getDspchList`,
      withSession(payload),
    );
  },

  getDispatchStopList(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/getDspchStopList",
      withSession(payload),
    );
  },

  getDispatchSmsHisList(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/getDispatchSmsHisList",
      withSession(payload),
    );
  },

  getDispatchApSetlList(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/getDispatchApSetlList",
      withSession(payload),
    );
  },

  getBookingChgCodeName(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/getBookingChgCodeName",
      withSession(payload),
    );
  },

  /////// ACTION
  updateCarrierRate(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/updateCarrierRate",
      withSession(payload),
    );
  },

  onTenderAccepted(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onTenderAccepted",
      withSession(payload),
    );
  },

  onTenderRejected(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onTenderRejected",
      withSession(payload),
    );
  },

  onChangeRegVeh(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onChangeRegVeh",
      withSession(payload),
    );
  },

  onChangeTempVeh(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onChangeTempVeh",
      withSession(payload),
    );
  },

  onVehicleChange(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onVehicleChange",
      withSession(payload),
    );
  },

  onVehicleCancel(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onVehicleCancel",
      withSession(payload),
    );
  },

  sendSMSForAppInstall(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/sendSMSForAppInstall",
      withSession(payload),
    );
  },

  // 엑셀
  gridExcelUpload(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/gridExcelUpload",
      withSession(payload),
    );
  },

  gridExcelAll(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/downloadExcel",
      withSession(payload),
      { responseType: "blob" },
    );
  },
  // gridExcel, onCarrierRateExcelAll, gridExcelAllBySearch 제거 (미사용)
};
