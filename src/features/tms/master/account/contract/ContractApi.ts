import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./Contract";

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

// dsSave 패턴 저장 (메인/사업장/매출계약 공용)
function postSave(url: string, payload: any) {
  const { dsSave, ...rest } = payload ?? {};
  return apiClient.post<CommonResponse>(`/contractService/${url}`, { dsSave }, {
    params: {
      ...getSessionFields(),
      MENU_CD: MENU_CODE,
      ...rest,
    },
  });
}

export const contractApi = {
  // ── 메인(고객사) 조회 ────────────────────────────────────────
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/contractService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // ── 사업장 조회 ──────────────────────────────────────────────
  getBuplaList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/contractService/searchBulpa`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // ── 매출계약 조회 ────────────────────────────────────────────
  getCustCntrctList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/contractService/searchCustCntrct`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // ── 고객사 상세 단건 조회 (우측 form 바인딩용) ────────────────
  searchOne(payload: any) {
    return apiClient.post<CommonResponse>(
      `/contractService/searchOne`,
      withSession({ MENU_CD: MENU_CODE, rowStatus: "S", ...payload }),
    );
  },

  // ── 메인 저장 ────────────────────────────────────────────────
  save(payload: any) {
    return postSave("save", payload);
  },
  // ── 사업장 저장 ──────────────────────────────────────────────
  saveBupla(payload: any) {
    return postSave("saveBupla", payload);
  },
  // ── 매출계약 중복체크 ────────────────────────────────────────
  checkCustCntrctDup(payload: any) {
    return postSave("checkCustCntrctDup", payload);
  },
  // ── 매출계약 저장 ────────────────────────────────────────────
  saveCustCntrct(payload: any) {
    return postSave("saveCustCntrct", payload);
  },
};
