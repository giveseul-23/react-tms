// src/app/services/vehicle/vehicleMgmtApi.ts
import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./VehicleMgmt";

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

export const vehicleMgmtApi = {
  // ── 조회 ─────────────────────────────────────────────────────
  getVehicleList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/vehicleService/search",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  getVehicleDetail(payload: any) {
    return apiClient.post<CommonResponse>(
      "/vehicleService/searchStateInfoList",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  // ── 등록 / 수정 / 삭제 ──────────────────────────────────────
  insertVehicle(payload: any) {
    return apiClient.post<CommonResponse>(
      "/vehicleMgmtService/insertVehicle",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  updateVehicle(payload: any) {
    return apiClient.post<CommonResponse>(
      "/vehicleMgmtService/updateVehicle",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  deleteVehicle(payload: any) {
    return apiClient.post<CommonResponse>(
      "/vehicleMgmtService/deleteVehicle",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  // ── 기능 버튼 ────────────────────────────────────────────────
  sendVehicleIF(payload: any) {
    return apiClient.post<CommonResponse>(
      "/vehicleMgmtService/sendVehicleIF",
      withSession(payload),
    );
  },

  changeContact(payload: any) {
    return apiClient.post<CommonResponse>(
      "/vehicleMgmtService/changeContact",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  changeGarageBatch(payload: any) {
    return apiClient.post<CommonResponse>(
      "/vehicleMgmtService/changeGarageBatch",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  // ── 엑셀 ────────────────────────────────────────────────────
  gridExcelAll(payload: any) {
    return apiClient.post<CommonResponse>(
      "/vehicleMgmtService/downloadExcel",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
      { responseType: "blob" },
    );
  },
};
