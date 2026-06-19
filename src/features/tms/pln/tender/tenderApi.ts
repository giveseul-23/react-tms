import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CD } from "./TenderReceiveDispatch";

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
  getDispatchList(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/searchPlanDispatch",
      withSession({ MENU_CD, ...payload }),
    );
  },

  getDispatchStopList(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/searchPlanStop",
      withSession({ MENU_CD, ...payload }),
    );
  },

  getDispatchSmsHisList(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/searchSmsHistory",
      withSession({ MENU_CD, ...payload }),
    );
  },

  getDispatchApSetlList(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/searchCarrierRate",
      withSession({ MENU_CD, ...payload }),
    );
  },

  getCarrierChgList(payload: any = {}) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/searchCarrierChgList",
      withSession({ MENU_CD, ...payload }),
    );
  },

  getCarrierRateExcel(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/searchCarrierRateExcel",
      withSession({ MENU_CD, ...payload }),
    );
  },

  updateCarrierRate(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/updateCarrierRate",
      withSession({ MENU_CD, ...payload }),
    );
  },

  onTenderAccepted(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/onTenderAccepted",
      withSession(payload),
    );
  },

  onTenderRejected(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/onTenderRejected",
      withSession({ MENU_CD, ...payload }),
    );
  },

  saveTrackingNumber(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/updateTrackNo",
      withSession(payload.dsSave),
    );
  },

  onChangeRegVeh(payload: any) {
    return apiClient.post<commonResponse>(
      "/dispatchPlanService/saveChangeVehicle",
      withSession({ MENU_CD, ...payload }),
    );
  },

  onChangeTempVeh(payload: any) {
    return apiClient.post<commonResponse>(
      "/dispatchPlanVehService/saveDspchSpotVeh",
      withSession({ MENU_CD, ...payload }),
    );
  },

  onVehicleChange(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/onVehicleChangeAndTenderAccepted",
      withSession({ MENU_CD, ...payload }),
    );
  },

  onVehicleCancel(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/onTenderCanceled",
      withSession({ MENU_CD, ...payload }),
    );
  },

  sendSMSForAppInstall(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/sendSmsPop",
      withSession({ MENU_CD, ...payload }),
    );
  },
};
