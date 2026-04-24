// src/app/services/dispatchPlan/dispatchPlanApi.ts
import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./DispatchPlan";

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

export const dispatchPlanApi = {
  // ── 조회 ─────────────────────────────────────────────────────
  getDispatchPlanList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 하단 탭: 경유처 ─────────────────────────────────────────
  getStopList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchPlanStop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 하단 탭: 할당주문 ───────────────────────────────────────
  getAllocOrderList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchAssignedShipment",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 하단 탭: 미할당주문 ─────────────────────────────────────
  getUnallocOrderList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchUnAssignedShipment",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 할당주문 / 미할당주문 SUB (품목 목록) ───────────────────
  getAllocOrderItemList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchAssignedShipmentDetail",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getUnallocOrderItemList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/searchUnAssignedShipmentDetail",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 저장 ─────────────────────────────────────────────────────
  saveDispatchPlan(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/save",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 계획확정 ────────────────────────────────────────────────
  confirmPlan(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/confirmPlan",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── ETA 예측 / 계산 ────────────────────────────────────────
  predictEta(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/predictEta",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  calcEta(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/calcEta",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 경유처 순서 저장 ────────────────────────────────────────
  saveStopOrder(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/saveStopOrder",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 엑셀 다운로드 ───────────────────────────────────────────
  gridExcelAll(payload: any) {
    return apiClient.post<CommonResponse>(
      "/dispatchPlanService/downloadExcel",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
      { responseType: "blob" },
    );
  },
};
