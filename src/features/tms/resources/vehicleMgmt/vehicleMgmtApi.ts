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

  // 단건 상세 조회 (센차 searchOne)
  searchOne(payload: any) {
    return apiClient.post<CommonResponse>(
      "/vehicleService/searchOne",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 저장 (등록/수정/삭제 공통 — dirty rows 배열 + rowStatus I/U/D) ──
  save(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/vehicleService/save",
      withSession(rows),
    );
  },

  // ── 기능 버튼 ────────────────────────────────────────────────
  // 차량 일괄전송(IF) — 선택 차량행(VEHARRAY 포함)
  sendVehicleIF(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/vehicleService/sendVehicleIF",
      withSession(rows),
    );
  },

  // 연락처(전화번호) 변경 — 운전자 계정 전화번호 갱신
  saveUserPhoneNumber(payload: any) {
    return apiClient.post<CommonResponse>(
      "/userAccountService/saveUserPhoneNumber",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 소속(차고지) 일괄변경 — 선택 차량행에 LOC_CD 적용
  changeDomicile(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/vehicleService/changeDomicile",
      withSession(rows),
    );
  },

  // 운송협력사 변경 — 선택 차량행에 CARR_CD 적용
  changeLgstCarr(rows: any[]) {
    return apiClient.post<CommonResponse>(
      "/vehicleService/changeLgstCarr",
      withSession(rows),
    );
  },

  // ── 팝업 검색 ────────────────────────────────────────────────
  // 운송사변경 팝업 — 물류운영그룹 운송협력사 목록
  searchLgstGrpCarr(payload: any) {
    return apiClient.post<CommonResponse>(
      "/vehicleService/searchLgstGrpCarr",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 소속변경 팝업 — 차량 목록
  searchDomicileChgPop(payload: any) {
    return apiClient.post<CommonResponse>(
      "/vehicleService/searchDomicileChgPop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 차량전송 팝업 — 디비전 재고관리시스템 목록
  searchDivInvSys(payload: any) {
    return apiClient.post<CommonResponse>(
      "/vehicleService/searchDivInvSys",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 차량검색 팝업(착지 지정차량 추가 등 외부 화면에서 사용) ──
  getVehPopLgstGrp(payload: any) {
    return apiClient.post<CommonResponse>(
      "/locationService/assignVehSearch",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getVehPopCarr(payload: any) {
    return apiClient.post<CommonResponse>(
      "/vehicleService/searchVehPopCarr",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getVehPopTrck(payload: any) {
    return apiClient.post<CommonResponse>(
      "/vehicleService/searchVehPopTrck",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
