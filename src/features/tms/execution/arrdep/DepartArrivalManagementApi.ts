import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CD } from "./DepartArrivalManagement";

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

const withSessionRows = (rows: any[]) => {
  const sessionFields = getSessionFields();
  return rows.map((item) => ({ ...sessionFields, MENU_CD, ...item }));
};

const withDsSave = (rows: any[]) =>
  withSession({ MENU_CD: MENU_CD, dsSave: withSessionRows(rows) });

export const departArrivalManagementApi = {
  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/searchDepartArrivalManagement`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 경유처
  getStopoverList(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/searchDepartArrivalManagementStop`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 할당주문
  getAssignedOrderList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchPlanService/searchAssignedShipment`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 할당주문 상세(품목)
  getAssignedOrderDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dispatchPlanService/searchAssignedShipmentDetail`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  inquireReceipt(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/inquireReceipt`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  getPodPopupList(payload: any) {
    return apiClient.post<commonResponse>(
      `/podService/searchPodPop`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  getPodPopupDetail(payload: any) {
    return apiClient.post<commonResponse>(
      `/podService/searchPodPopDetail`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  getInterStopEta(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/searchInterStopETA`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  getDlvryRoute(payload: any) {
    return apiClient.post<commonResponse>(
      `/mapService/getDlvryRoute`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  getExpectedRoute(payload: any) {
    return apiClient.post<commonResponse>(
      `/mapService/getExpectedRoute`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  searchDispatchTrace(payload: any) {
    return apiClient.post<commonResponse>(
      `/traceService/searchDispathTrace`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  downloadPodFile(payload: { KEY_ID: string; FILE_ID: string }) {
    return apiClient.post(
      `/fileService/downloadFile`,
      withSession({ MENU_CD: MENU_CD, FILE_DMN_TCD: "POD", ...payload }),
      { responseType: "blob" },
    );
  },

  getServiceActivityList(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/searchSrvcAtvt`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  saveServiceActivities(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/saveSrvcAtvt`,
      withDsSave(payload.dsSave),
    );
  },

  downloadServiceActivityFile(payload: { KEY_ID: string; FILE_ID: string }) {
    return apiClient.post(
      `/fileService/downloadFile`,
      withSession({
        MENU_CD: MENU_CD,
        FILE_DMN_TCD: "SERVICE_ACTIVITIES",
        ...payload,
      }),
      { responseType: "blob" },
    );
  },

  controlRoute(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/controlRoute`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 작업시작 (출발지)
  startLoading(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/onStartWork`,
      withDsSave(payload),
    );
  },

  // 운송시작
  startTransport(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/onStartTransportation`,
      withDsSave(payload),
    );
  },

  // 확정복귀
  cancelTransport(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/onReturnToConfirm`,
      withDsSave(payload),
    );
  },

  // 배송확정/하차취소
  cancelDeliveryComplete(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/onDeliveredCancel`,
      withDsSave(payload),
    );
  },

  // 하차완료(운행종료)
  completeTransport(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/onDelivered`,
      withDsSave(payload),
    );
  },

  // 이동거리 재계산 (RE_SET)
  resetDispatch(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/recalcDistance`,
      withDsSave(payload),
    );
  },

  // 정산구분 변경 (RE_SET)
  changeDspchApProcTp(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/changeDspchApProcTp`,
      withDsSave(payload),
    );
  },

  // 계획ID 변경 (RE_SET)
  changeDspchPlnId(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/changeDspchPlnId`,
      withDsSave(payload),
    );
  },

  save(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/save`,
      withDsSave(payload.dsSave),
    );
  },

  saveStopover(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/saveDepartArrivalManagementStop`,
      withDsSave(payload.dsSave),
    );
  },

  // 컨테이너(피박스 회수) 저장
  confirmPBoxRecovery(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/saveCntr`,
      withDsSave(rows),
    );
  },
};
