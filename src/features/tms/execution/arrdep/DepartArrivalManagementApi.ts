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
      withSession(payload),
    );
  },

  // 운송시작
  startTransport(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/onStartTransportation`,
      withSession(payload),
    );
  },

  // 확정복귀
  cancelTransport(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/onReturnToConfirm`,
      withSession(payload),
    );
  },

  // 배송확정/하차취소
  cancelDeliveryComplete(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/onDeliveredCancel`,
      withSession(payload),
    );
  },

  // 하차완료(운행종료)
  completeTransport(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/onDelivered`,
      withSession(payload),
    );
  },

  // 이동거리 재계산 (RE_SET)
  resetDispatch(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/recalcDistance`,
      withSession(payload),
    );
  },

  // 정산구분 변경 (RE_SET)
  changeDspchApProcTp(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/changeDspchApProcTp`,
      withSession(payload),
    );
  },

  // 계획ID 변경 (RE_SET)
  changeDspchPlnId(payload: any) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/changeDspchPlnId`,
      withSession(payload),
    );
  },

  save(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/save`,
      withSession(rows),
    );
  },

  // 컨테이너(피박스 회수) 저장
  confirmPBoxRecovery(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/departArrivalManagementService/saveCntr`,
      withSession(rows),
    );
  },
};
