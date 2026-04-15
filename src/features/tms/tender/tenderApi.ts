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

export const tenderApi = {
    MENU_CD: "MENU_PLAN_TENDER",  
  ////// SEARCH
  getDispatchList(payload: any) {
    return apiClient.post<commonResponse>(
      //`/openapina/carrier/getDspchList`,
      `/tenderReceiveDispatchService/searchPlanDispatch`,
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload
      }),
    );
  },

  
  getDispatchStopList(payload: any) {
    return apiClient.post<commonResponse>(
      //"/openapina/carrier/getDspchStopList",
      "/tenderReceiveDispatchService/searchPlanStop",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload
      }),
    );
  },

  getDispatchSmsHisList(payload: any) {
    return apiClient.post<commonResponse>(
      //"/openapina/carrier/getDispatchSmsHisList",
      "/tenderReceiveDispatchService/searchSmsHistory",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload
      }),
    );
  },

  getDispatchApSetlList(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/searchCarrierRate",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload
      }),
    );
  },

  getBookingChgCodeName(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/getBookingChgCodeName",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload
      }),
    );
  },

  /////// ACTION
  updateCarrierRate(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/updateCarrierRate",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload
      }),
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
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload
      }),    );
  },

  onChangeRegVeh(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onChangeRegVeh",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload
      }),
    );
  },

  onChangeTempVeh(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onChangeTempVeh",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload
      }),
    );
  },

  onVehicleChange(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onVehicleChange",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload
      }),
    );
  },

  onVehicleCancel(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onVehicleCancel",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload
      }),
    );
  },

  sendSMSForAppInstall(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/sendSMSForAppInstall",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload
      }),
    );
  },

  // 엑셀
  gridExcelUpload(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/gridExcelUpload",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload
      }),
    );
  },

  gridExcelAll(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/downloadExcel",
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload
      }),
      { responseType: "blob" },
    );
  },
  // gridExcel, onCarrierRateExcelAll, gridExcelAllBySearch 제거 (미사용)
};
