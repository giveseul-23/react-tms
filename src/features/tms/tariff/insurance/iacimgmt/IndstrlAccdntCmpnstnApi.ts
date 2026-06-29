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
  saveRate(payload: { dsSave: any[] }) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<commonResponse>(
      `/iaciService/saveRate`,
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
  saveChg(payload: { dsSave: any[] }) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<commonResponse>(
      `/iaciService/saveChg`,
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
  // 보험료 일괄 등록 (월대/용차)
  saveBatch(rows: any[]) {
    return apiClient.post<commonResponse>(
      `/iaciService/saveBatch`,
      { dsSave: withSession(rows) },
      { params: { ...getSessionFields(), MENU_CD: MENU_CODE } },
    );
  },
};
