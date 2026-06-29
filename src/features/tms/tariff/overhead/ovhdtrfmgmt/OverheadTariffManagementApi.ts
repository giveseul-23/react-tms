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
import { MENU_CODE } from "./OverheadTariffManagement";

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

export const overheadTariffManagementApi = {
  // ── 메인 조회 ─────────────────────────────────────────────────
  getList(payload: any) {
    return apiClient.post<commonResponse>(
      `/overheadTariffMgmtService/search`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  // ── 상세 조회 ─────────────────────────────────────────────────
  getSubChgList(payload: any) {
    return apiClient.post<commonResponse>(
      `/overheadTariffMgmtService/searchSubChg`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  getSubChgDtlList(payload: any) {
    return apiClient.post<commonResponse>(
      `/overheadTariffMgmtService/searchSubChgDtl`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  // ── 저장 (추가/수정) ──────────────────────────────────────────
  // ── 저장 (그리드별 — dirty rows 배열) ─────────────────────────
  save(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/overheadTariffMgmtService/save`,
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },
  // 물류그룹(sub01) 저장
  saveOvrheadLgstGrp(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/overheadTariffMgmtService/saveOvrheadLgstGrp`,
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },
  // 간접비항목(sub02) 저장
  saveOvrheadLgstGrpChg(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/overheadTariffMgmtService/saveOvrheadLgstGrpChg`,
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },
  // 요율 복사
  copyTariffOverhead(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      `/overheadTariffMgmtService/copyTariffOverhead`,
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },
  // 요율 생성 (AddPopup) — body { LGST_GRP_CD_LIST, CHG_LIST }
  createTariffOverhead(payload: { LGST_GRP_CD_LIST: any[]; CHG_LIST: any[] }) {
    return apiClient.post<commonResponse>(
      `/overheadTariffMgmtService/createTariffOverhead`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 팝업 검색 ─────────────────────────────────────────────────
  // 생성 팝업 — 디비전별 물류센터 목록
  searchPopLgst(payload: any) {
    return apiClient.post<commonResponse>(
      `/overheadTariffMgmtService/searchPopLgst`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
