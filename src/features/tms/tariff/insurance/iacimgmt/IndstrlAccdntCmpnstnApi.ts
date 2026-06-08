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
import { MENU_CODE } from "./IndstrlAccdntCmpnstn";

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

export const indstrlAccdntCmpnstnApi = {
  // ── 메인 조회 ─────────────────────────────────────────────────
  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/iaciService/searchLgst`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  // ── 상세 조회 ─────────────────────────────────────────────────
  getRateList(payload: any) {
    return apiClient.post<commonResponse>(
      `/iaciService/searchRate`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  getChgList(payload: any) {
    return apiClient.post<commonResponse>(
      `/iaciService/searchChg`,
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
  save(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/iaciService/save`,
      withSession(rows),
    );
  },
  saveRate(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/iaciService/saveRate`,
      withSession(rows),
    );
  },
  saveChg(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/iaciService/saveChg`,
      withSession(rows),
    );
  },
  // 보험료 일괄 등록 (월대/용차)
  saveBatch(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/iaciService/saveBatch`,
      withSession(rows),
    );
  },
};
