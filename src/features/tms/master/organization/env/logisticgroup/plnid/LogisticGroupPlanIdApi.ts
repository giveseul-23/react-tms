import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./LogisticGroupPlanId";

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

export const logisticGroupPlanId = {
  // ── 메인 조회 ─────────────────────────────────────────────────
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/logisticGroupPlanIdService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 상세 조회 ─────────────────────────────────────────────────
  getDetailList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/logisticGroupPlanIdService/searchDetail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 저장 (추가/수정/삭제 한 번에) — dsSave 패턴 ─────────────────
  // useBaseController.saveGrid 가 { dsSave: [...] } 형태로 호출.
  save(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      `/logisticGroupPlanIdService/saveDetail`,
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
};