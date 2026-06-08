import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CD } from "./Location";

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

export const locationApi = {
  // 메인 착지 조회
  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/search`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 진입제약 (차량유형)
  getEntryRestrictionList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchVehTypeInfoList`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 지정차량
  getAssignedVehicleList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/assignVehList`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 제외차량
  getExcludedVehicleList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchLocExcldVeh`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 등록권역
  getRegisteredZoneList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/zoneRegistSearch`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 휴무일
  getHolidayList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchClosedDay`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 선호운송협력사
  getPreferredCarrierList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchPreferedCarr`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 도착요구시간관리 (배송시간대)
  getArrivalRequestTimeList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchDeliveryTimeWindow`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 도크
  getDockList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchDock`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // SMS
  getSmsList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchSms`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 착지역할
  getLocationRoleList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchLocRoleTp`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // LBL_LOC_SALES
  getLocSalesList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchLocSales`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 기타
  getEtcList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchLocEtc`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 주문유형별계획ID
  getOrderTypePlanIdList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchLocOrdPln`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 권역추가 팝업 — 권역 검색 (서버 zoneSearch)
  searchZoneForAdd(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/zoneSearch`,
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  // 권역추가 팝업 — 적용 저장 (서버 saveZone, jsonData = { ZONE_LIST, LOC_LIST }).
  saveZone(payload: { ZONE_LIST: any[]; LOC_LIST: any[] }) {
    return apiClient.post<commonResponse>(
      `/locationService/saveZone`,
      {
        ZONE_LIST: withSession(payload.ZONE_LIST),
        LOC_LIST: withSession(payload.LOC_LIST),
      },
      { params: { ...getSessionFields(), MENU_CD: MENU_CD } },
    );
  },

  // ── 메인 저장 ────────────────────────────────────────────────
  // base.saveGrid 가 호출하는 시그니처: ({ dsSave }) => Promise
  save(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/locationService/save`,
      withSession({
        dsSave: payload.dsSave,
        MENU_CD: MENU_CD,
      }),
    );
  },

  // ── sub 12개 저장 — TODO: 실제 endpoint 로 교체 필요 ─────────
  // 임시 URL: /locationService/saveXxx 패턴.
  saveEntryRestriction(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/locationService/saveVehTypeInfo`,
      withSession({
        dsSave: payload.dsSave,
        MENU_CD: MENU_CD,
      }),
    );
  },
  saveAssignedVehicle(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/locationService/saveAssignVeh`,
      withSession({
        dsSave: payload.dsSave,
        MENU_CD: MENU_CD,
      }),
    );
  },
  // 제외차량 (서버 saveLocExcldVeh)
  saveExcludedVehicle(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/locationService/saveLocExcldVeh`,
      withSession({
        dsSave: payload.dsSave,
        MENU_CD: MENU_CD,
      }),
    );
  },
  saveRegisteredZone(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/locationService/deleteRegion`,
      withSession({
        dsSave: payload.dsSave,
        MENU_CD: MENU_CD,
      }),
    );
  },
  saveHoliday(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/locationService/saveClosedDay`,
      withSession({
        dsSave: payload.dsSave,
        MENU_CD: MENU_CD,
      }),
    );
  },
  savePreferredCarrier(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/locationService/savePreferedCarr`,
      withSession({
        dsSave: payload.dsSave,
        MENU_CD: MENU_CD,
      }),
    );
  },
  saveArrivalRequestTime(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/locationService/saveDeliveryTimeWindow`,
      withSession({
        dsSave: payload.dsSave,
        MENU_CD: MENU_CD,
      }),
    );
  },
  // 도크 (서버 dockService/saveMain)
  saveDock(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/dockService/saveMain`,
      withSession({
        dsSave: payload.dsSave,
        MENU_CD: MENU_CD,
      }),
    );
  },
  saveSms(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/locationService/saveSms`,
      withSession({
        dsSave: payload.dsSave,
        MENU_CD: MENU_CD,
      }),
    );
  },
  saveLocationRole(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/locationService/saveLocRoleTp`,
      withSession({
        dsSave: payload.dsSave,
        MENU_CD: MENU_CD,
      }),
    );
  },
  saveLocSales(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/locationService/saveLocSales`,
      withSession({
        dsSave: payload.dsSave,
        MENU_CD: MENU_CD,
      }),
    );
  },
  saveEtc(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/locationService/saveLocEtc`,
      withSession({
        dsSave: payload.dsSave,
        MENU_CD: MENU_CD,
      }),
    );
  },
  saveOrderTypePlanId(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/locationService/saveLocOrdPln`,
      withSession({
        dsSave: payload.dsSave,
        MENU_CD: MENU_CD,
      }),
    );
  },
};
