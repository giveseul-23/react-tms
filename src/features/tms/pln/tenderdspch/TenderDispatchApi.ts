import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./TenderDispatch";

type CommonResponse = {
  rows: [];
};

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();
  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }
  return { ...sessionFields, ...payload };
};

// 서버: /tenderReceiveDispatchService (센차 TenderDispatchModel proxy url + Controller saveUrl)
export const tenderDispatchApi = {
  ////// SEARCH
  // 메인: 운송배차 조회
  getDispatchList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/tenderReceiveDispatchService/searchPlanDispatch",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // sub01: 경유지(착지)
  getPlanStopList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/tenderReceiveDispatchService/searchPlanStop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // sub02: 배차된 운송지시
  getAssignedShipmentList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/tenderReceiveDispatchService/searchAssignedShipment",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // sub03: 배차된 운송지시 상세(품목)
  getAssignedShipmentDetailList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/tenderReceiveDispatchService/searchAssignedShipmentDetail",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  ////// ACTION (saveGrid: rowStatus='U' 셋 후 저장)
  // 운송요청
  onTendered(payload: any) {
    return apiClient.post<CommonResponse>(
      "/tenderReceiveDispatchService/onTendered",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 운송요청수락
  onTenderAccepted(payload: any) {
    return apiClient.post<CommonResponse>(
      "/tenderReceiveDispatchService/onTenderAccepted",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 운송요청거절
  onTenderRejected(payload: any) {
    return apiClient.post<CommonResponse>(
      "/tenderReceiveDispatchService/onTenderRejected",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 운송요청취소
  onTenderCanceled(payload: any) {
    return apiClient.post<CommonResponse>(
      "/tenderReceiveDispatchService/onTenderCanceled",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 계획확정변경
  onPlanConfirmChange(payload: any) {
    return apiClient.post<CommonResponse>(
      "/tenderReceiveDispatchService/onPlanConfirmChange",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  searchChangeVehicle(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchDispatchChangeVehiclePop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  saveChangeVehicle(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveChangeVehicle",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },

  saveDspchSpotVeh(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanVehService/saveDspchSpotVeh",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
