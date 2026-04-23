import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";

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
  MENU_CD: "MENU_LOCATION_MANAGER",

  // 메인 착지 조회
  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/search`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 진입제약 (차량유형)
  getEntryRestrictionList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchVehTypeInfoList`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 지정차량
  getAssignedVehicleList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/assignVehList`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 제외차량
  getExcludedVehicleList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchLocExcldVeh`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 일자금지
  getDateProhibitionList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchDateProhibition`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 등록권역
  getRegisteredZoneList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/zoneRegistSearch`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 휴무일
  getHolidayList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchClosedDay`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 선호운송협력사
  getPreferredCarrierList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchPreferedCarr`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 도착요구시간관리 (배송시간대)
  getArrivalRequestTimeList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchDeliveryTimeWindow`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 도크
  getDockList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchDock`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // SMS
  getSmsList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchSms`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 착지역할
  getLocationRoleList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchLocRoleTp`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // LBL_LOC_SALES
  getLocSalesList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchLocSales`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 기타
  getEtcList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchLocEtc`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  // 주문유형별계획ID
  getOrderTypePlanIdList(payload: any) {
    return apiClient.post<commonResponse>(
      `/locationService/searchLocOrdPln`,
      withSession({ MENU_CD: this.MENU_CD, ...payload }),
    );
  },

  save(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/locationService/save`,
      withSession(rows),
    );
  },
};
