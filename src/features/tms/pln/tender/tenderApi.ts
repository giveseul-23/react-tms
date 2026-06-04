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
  ////// SEARCH
  getDispatchList(payload: any) {
    return apiClient.post<commonResponse>(
      //`/openapina/carrier/getDspchList`,
      `/tenderReceiveDispatchService/searchPlanDispatch`,
      withSession({
        MENU_CD: MENU_CD,
        ...payload,
      }),
    );
  },

  getDispatchStopList(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/searchPlanStop",
      withSession({
        MENU_CD: MENU_CD,
        ...payload,
      }),
    );
  },

  getDispatchSmsHisList(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/searchSmsHistory",
      withSession({
        MENU_CD: MENU_CD,
        ...payload,
      }),
    );
  },

  getDispatchApSetlList(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/searchCarrierRate",
      withSession({
        MENU_CD: MENU_CD,
        ...payload,
      }),
    );
  },

  getBookingChgCodeName(payload: any) {
    return apiClient.post<commonResponse>(
      "/tmsCommonService/searchBookingChgCodeName",
      withSession({
        MENU_CD: MENU_CD,
        ...payload,
      }),
    );
  },

  /////// ACTION
  updateCarrierRate(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/updateCarrierRate",
      withSession({
        MENU_CD: MENU_CD,
        ...payload,
      }),
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
      withSession({
        MENU_CD: MENU_CD,
        ...payload,
      }),
    );
  },

  onChangeRegVeh(payload: any) {
    return apiClient.post<commonResponse>(
      "/dispatchPlanService/saveChangeVehicle",
      withSession({
        MENU_CD: MENU_CD,
        ...payload,
      }),
    );
  },

  onChangeTempVeh(payload: any) {
    return apiClient.post<commonResponse>(
      "/dispatchPlanVehService/saveDspchSpotVeh",
      withSession({
        MENU_CD: MENU_CD,
        ...payload,
      }),
    );
  },

  onVehicleChange(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/onVehicleChangeAndTenderAccepted",
      withSession({
        MENU_CD: MENU_CD,
        ...payload,
      }),
    );
  },

  onVehicleCancel(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/onTenderCanceled",
      withSession({
        MENU_CD: MENU_CD,
        ...payload,
      }),
    );
  },

  sendSMSForAppInstall(payload: any) {
    return apiClient.post<commonResponse>(
      "/tenderReceiveDispatchService/sendSmsPop",
      withSession({
        MENU_CD: MENU_CD,
        ...payload,
      }),
    );
  },

  // 엑셀
  gridExcelUpload(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/gridExcelUpload",
      withSession({
        MENU_CD: MENU_CD,
        ...payload,
      }),
    );
  },
  // gridExcel, onCarrierRateExcelAll, gridExcelAllBySearch, gridExcelAll(공통 excelService 로 이관) 제거 (미사용)
};
