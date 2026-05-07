// ────────────────────────────────────────────────────────────────
// [가이드] API 템플릿
//
// 사용 방법
// 1. 이 파일을 대상 폴더로 복사 후 파일명 교체 (예: FeatureApi.ts)
// 2. export 상수명 (featureApi) 을 화면명에 맞춰 교체
// 3. 각 함수의 URL / 페이로드를 실제 백엔드 스펙에 맞게 수정
// 4. MENU_CODE 는 View(Guide_Feature.tsx) 에서 export — 여기서 import 받아 사용
//
// 공통 패턴
// - apiClient.post 로 호출
// - withSession 으로 세션 필드 자동 주입
// - 모든 요청에 MENU_CD 포함
// - 저장 API 는 dsSave 패턴: body { dsSave }, params 에 세션/MENU_CD/그 외
// - 배열 페이로드(저장 시) 도 withSession 이 각 원소에 세션 자동 주입
// ────────────────────────────────────────────────────────────────

import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./Guide_Feature";

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

export const featureApi = {
  // ── 메인 조회 ─────────────────────────────────────────────────
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/featureService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 상세 조회 ─────────────────────────────────────────────────
  getDetailList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/featureService/searchDetail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 저장 (추가/수정/삭제 한 번에) — dsSave 패턴 ─────────────────
  // useBaseController.saveGrid 가 { dsSave: [...] } 형태로 호출.
  save(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      `/featureService/save`,
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          MENU_CD: MENU_CODE,
          ...rest,
        },
      },
    );
  },

  // ── 삭제 (필요 시) ────────────────────────────────────────────
  remove(payload: any) {
    return apiClient.post<CommonResponse>(
      `/featureService/delete`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};

// ────────────────────────────────────────────────────────────────
// [참고] 그리드별 저장 API 가 다른 경우 (LgstgrpOprConfigMst 패턴)
//
//   export const featureApi = {
//     getConfigList(payload) { ... },
//     saveConfig(payload) { ... },           // main 그리드 저장
//     getConfigDetailList(payload) { ... },
//     saveConfigDetail(payload) { ... },     // sub01 저장
//     ...
//   };
//
//   // Controller 에서 그리드별 저장 API 매핑
//   base.saveGrid("main", api.saveConfig, { ... });
//   base.saveGrid("sub01", api.saveConfigDetail, { ... });
// ────────────────────────────────────────────────────────────────
