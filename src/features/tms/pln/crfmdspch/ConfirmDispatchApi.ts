import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./ConfirmDispatch";

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

const post = (url: string, payload: any) => {
  if (Array.isArray(payload)) {
    return apiClient.post<commonResponse>(
      url,
      withSession({ MENU_CD: MENU_CODE, dsSave: withSession(payload) }),
    );
  }

  if (Array.isArray(payload?.dsSave)) {
    return apiClient.post<commonResponse>(
      url,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
        dsSave: withSession(payload.dsSave),
      }),
    );
  }

  return apiClient.post<commonResponse>(
    url,
    withSession({ MENU_CD: MENU_CODE, ...payload }),
  );
};

const postFlat = (url: string, payload: any) =>
  apiClient.post<commonResponse>(
    url,
    withSession({ MENU_CD: MENU_CODE, ...payload }),
  );

export const confirmDispatchApi = {
  // ── 조회 ──────────────────────────────────────────────────────
  getList: (p: any) => post(`/confirmDispatchService/searchConfirmDispatch`, p),
  getShipmentList: (p: any) =>
    post(`/confirmDispatchService/searchConfirmDispatchShipment`, p),
  getShipmentDetailList: (p: any) =>
    post(`/confirmDispatchService/searchConfirmDispatchShipmentDetail`, p),
  getPodList: (p: any) => post(`/confirmDispatchService/searchPodByDspchNo`, p),
  getPodEventLogList: (p: any) =>
    post(`/confirmDispatchService/searchPodEventLogByDspchNo`, p),
  getAssignAssistList: (p: any) =>
    post(`/confirmDispatchService/searchAssignAssist`, p),
  getUnassignAssistList: (p: any) =>
    post(`/confirmDispatchService/searchUnassignAssist`, p),
  getDockList: (p: any) => post(`/confirmDispatchService/searchDock`, p),
  searchLdngOrder: (p: any) => post(`/confirmDispatchService/searchLdngOrder`, p),

  // ── 액션 (서버 실제 엔드포인트) ───────────────────────────────
  // 출발지 작업 시작
  onStartWork: (p: any) => post(`/departArrivalManagementService/onStartWork`, p),
  // 상차 요청 / 취소 / 완료 / 완료취소 / 추가배송
  onRequestLoading: (p: any) => post(`/confirmDispatchService/onRequestLoading`, p),
  onCancelLoadingRequest: (p: any) =>
    post(`/confirmDispatchService/onCancelLoadingRequest`, p),
  onRequestLoadingComplete: (p: any) =>
    post(`/confirmDispatchService/onRequestLoadingComplete`, p),
  onCancelLoadingComplete: (p: any) =>
    post(`/confirmDispatchService/onCancelLoadingComplete`, p),
  onRequestLoadingAddShpm: (p: any) =>
    post(`/confirmDispatchService/onRequestLoadingAddShpm`, p),
  // 배차확정 / 확정취소
  onDispatchConfirm: (p: any) => post(`/confirmDispatchService/onDispatchConfirm`, p),
  onDispatchConfirmCancel: (p: any) =>
    post(`/confirmDispatchService/onDispatchConfirmCancel`, p),
  // 차량 변경 (등록차량 / 임시차량)
  // 변경 가능 차량 목록 조회 (공통 ChangeVehiclePopup 주입용)
  searchChangeVehicle: (p: any) =>
    post(`/dispatchPlanService/searchDispatchChangeVehiclePop`, p),
  onChangeRegVeh: (p: any) => post(`/dispatchPlanService/saveChangeVehicle`, p),
  onChangeTempVeh: (p: any) =>
    postFlat(`/dispatchPlanVehService/saveDspchSpotVeh`, p),
  // 조수 배정/해제/등록
  onAssignAssist: (p: any) => post(`/confirmDispatchService/onAssignAssist`, p),
  onUnassignAssist: (p: any) => post(`/confirmDispatchService/onUnassignAssist`, p),
  onAssistRegister: (p: any) => post(`/confirmDispatchService/onAssistRegister`, p),
  // 도크 배정
  onDockAssign: (p: any) => post(`/confirmDispatchService/onDockAssign`, p),
  // POD(인수증) 발급 / 재발급 / 발급취소
  createPodReportOrReprint: (p: any) =>
    post(`/confirmDispatchService/createPodReportOrReprint`, p),
  issuePod: (p: any) => post(`/podService/issuePod`, p),
  cancelIssuePod: (p: any) => post(`/podService/cancelIssuePod`, p),
  // 저장
  saveShipmentDetail: (p: { dsSave: any[] }) =>
    post(`/confirmDispatchService/saveShipmentDetail`, p.dsSave),
  saveShipmentPrfr: (p: { dsSave: any[] }) =>
    post(`/confirmDispatchService/saveShipmentPrfr`, p.dsSave),
  saveShipmentWgtPrfr: (p: { dsSave: any[] }) =>
    post(`/confirmDispatchService/saveShipmentWgtPrfr`, p.dsSave),
};
