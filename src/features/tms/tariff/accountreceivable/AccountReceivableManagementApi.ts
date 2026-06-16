import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./AccountReceivableManagement";

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

export const accountReceivableManagementApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/accountReceivableManagementService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  save(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/accountReceivableManagementService/save",
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

  // 복사 팝업 — 매출계약코드 중복 확인
  dupCheck(arTrfCd: string) {
    return apiClient.post<CommonResponse>(
      "/accountReceivableService/dupCheck",
      { dsSave: withSession([{ AR_TRF_CD: arTrfCd }]) },
      { params: { ...getSessionFields(), MENU_CD: MENU_CODE } },
    );
  },

  // 복사 팝업 — 복사 생성
  copyAccountReceivable(derived: any) {
    return apiClient.post<CommonResponse>(
      "/accountReceivableService/copyAccountReceivable",
      { data: withSession(derived) },
      { params: { ...getSessionFields(), MENU_CD: MENU_CODE } },
    );
  },
};
