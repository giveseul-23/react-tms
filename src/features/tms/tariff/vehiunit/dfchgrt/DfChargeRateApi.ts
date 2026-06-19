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
import { MENU_CODE } from "./DfChargeRate";

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

// 표준 dsSave 저장 — body { dsSave: rows }, 세션/MENU_CD 는 쿼리 params.
// (서버 RequestDataReader 가 named dataset "dsSave" 를 읽으므로 배열 body 직접 전송 금지)
const dsSavePost = (url: string, rows: any[]) =>
  apiClient.post<commonResponse>(
    url,
    { dsSave: rows },
    { params: { ...getSessionFields(), MENU_CD: MENU_CODE } },
  );

export const dfChargeRateApi = {
  // ── 메인 조회 ─────────────────────────────────────────────────
  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/search`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  // ── 상세 조회 ─────────────────────────────────────────────────
  getRateItemList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/searchRateItem`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  getRateCarrList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/searchRateCarr`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  getRateVehTpList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/searchRateVehTp`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  getRateItmVehTypeList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/searchRateItmVehType`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  getRateItmVehList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/searchRateItmVeh`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  // ── 저장 (추가/수정) ──────────────────────────────────────────
  // ── 저장 (그리드별 — dirty rows 배열) ─────────────────────────
  save(payload: { dsSave: any[] }) {
    return dsSavePost(`/dfChargeRateService/save`, payload.dsSave);
  },
  saveCharge(payload: { dsSave: any[] }) {
    return dsSavePost(`/dfChargeRateService/saveCharge`, payload.dsSave);
  },
  saveCarr(payload: { dsSave: any[] }) {
    return dsSavePost(`/dfChargeRateService/saveCarr`, payload.dsSave);
  },
  saveVehTp(payload: { dsSave: any[] }) {
    return dsSavePost(`/dfChargeRateService/saveVehTp`, payload.dsSave);
  },
  saveItmVehTp(payload: { dsSave: any[] }) {
    return dsSavePost(`/dfChargeRateService/saveItmVehTp`, payload.dsSave);
  },
  saveItmVeh(payload: { dsSave: any[] }) {
    return dsSavePost(`/dfChargeRateService/saveItmVeh`, payload.dsSave);
  },

  // ── 계약서 복사 ───────────────────────────────────────────────
  addCopy(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/addCopy`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 요율 생성 (차량유형별/차량별) ─────────────────────────────
  addChargeRate(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/addChargeRate`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 팝업 검색 ─────────────────────────────────────────────────
  // 차량유형별금액 추가 팝업 (EachAddPop)
  searchTariffVehicleTypeList(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/searchTariffVehicleTypeList`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 차량별금액 추가 팝업 (AddVehPop)
  searchVehPop(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/searchVehPop`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 요율생성 팝업 (AddPop) — 물류그룹/운송사/차량유형
  searchLgstPop(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/searchLgstPop`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  searchCarrPop(payload: any) {
    return apiClient.post<commonResponse>(
      `/dfChargeRateService/searchCarrPop`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  searchVehicleType(payload: any) {
    return apiClient.post<commonResponse>(
      `/vehicleTypeService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
