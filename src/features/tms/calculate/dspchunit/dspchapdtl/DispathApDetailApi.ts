import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./DispathApDetail";

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

export const dispathApDetailApi = {
  // 배차지급정산상세 조회 (서버 mainInfo proxy)
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dispatchApDetailService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 동적 비용 컬럼 메타 조회 (센차 searchChgCd)
  searchChgCd(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dispatchApDetailService/searchChgCd`,
      withSession({ module: "TMS", MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
