// ────────────────────────────────────────────────────────────────
// [가이드] API 템플릿
//
// 사용 방법
// 1. 이 파일을 대상 폴더로 복사 후 파일명 교체 (예: FeatureApi.ts)
// 2. export 상수명 (featureApi) 및 MENU_CD 를 실제 값으로 교체
// 3. 각 함수의 URL / 페이로드를 실제 백엔드 스펙에 맞게 수정
//
// 공통 패턴
// - apiClient.post 로 호출
// - withSession 으로 세션 필드 자동 주입
// - MENU_CD 를 모든 요청에 포함
// - 배열 페이로드(저장용) 시에도 세션 필드 주입
// ────────────────────────────────────────────────────────────────

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

export const dfChargeRateApi = {
  // TODO: 실제 메뉴 코드로 교체
  MENU_CD: "MENU_DF_RATE_MGMT",

  // ── 메인 조회 ─────────────────────────────────────────────────
  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/search`,
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },

  // ── 상세 조회 ─────────────────────────────────────────────────
  getRateItemList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/searchRateItem`,
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },

  getRateCarrList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/searchRateCarr`,
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },

  getRateVehTpList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/searchRateVehTp`,
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },

  getRateItmVehTypeList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/searchRateItmVehType`,
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },

  getRateItmVehList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/searchRateItmVeh`,
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },

  // ── 저장 (추가/수정) ──────────────────────────────────────────
  save(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/save`,
      withSession(rows),
    );
  },

  // ── 삭제 ──────────────────────────────────────────────────────
  remove(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/delete`,
      withSession({
        MENU_CD: this.MENU_CD,
        ...payload,
      }),
    );
  },
};
