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

  // 차량변경 팝업 조회(지입차/용차/택배 공용 — vehOpTp 로 분기)
  getVehicleChgPopList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/tenderReceiveDispatchService/searchVehicleChgPop",
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

  // 차량변경 저장 — 센차 VehChgPop 의 receiveTo 결과는 부모 saveChangeVehicle 로 반영.
  // TODO: 차량변경 저장 URL 은 센차 부모(DispatchPlanControllerAB)에서 처리되어 본 화면 소스에 명시되지 않음.
  //       TenderReceiveDispatch 의 onChangeRegVeh(/dispatchPlanService/saveChangeVehicle) 패턴을 준용.
  saveChangeVehicle(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveChangeVehicle",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
