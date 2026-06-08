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
import { MENU_CODE } from "./AccountReceivableSubChargeManagement";
import { DsSave } from "@/app/components/grid/gridCommon";

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

export const accountReceivableSubChargeManagementApi = {
  // ── 메인 조회 ─────────────────────────────────────────────────
  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/accountReceivableSubChargeManagementService/search`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  // ── 상세 조회 ─────────────────────────────────────────────────
  getDetail01List(payload: any) {
    return apiClient.post<commonResponse>(
      `/accountReceivableSubChargeManagementService/searchSub01`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  // ── 상세 조회 ─────────────────────────────────────────────────
  getDetail02List(payload: any) {
    return apiClient.post<commonResponse>(
      `/accountReceivableSubChargeManagementService/searchSub02`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  // ── 저장 (추가/수정) ──────────────────────────────────────────
  /**
   * 저장 — menuConfig/LanguagePack 와 동일한 dsSave 패턴 (URL params + body { dsSave }).
   */
  // ── 저장 (그리드별 — dirty rows 배열) ─────────────────────────
  save(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/accountReceivableSubChargeManagementService/save`,
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },
  // 비용(sub01) 저장
  saveCost(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/accountReceivableSubChargeManagementService/saveCost`,
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },
  // 조건(sub02) 저장
  saveCostCond(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/accountReceivableSubChargeManagementService/saveCostCond`,
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },
  // 추가 팝업 — 청구요율 라인 검색
  searchArTrfChgLinePopup(payload: any) {
    return apiClient.post<commonResponse>(
      `/accountReceivableSubChargeManagementService/searchArTrfChgLinePopup`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
