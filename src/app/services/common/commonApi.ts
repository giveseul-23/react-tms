import { apiClient } from "@/app/api/client";
import type { ServerSearchConditionRow } from "@/features/search/search.meta.types";

export type commonRequest = {
  sesUserId: string;
  userId: string;
  sqlProp: string;
  ACCESS_TOKEN: string;
};

export type comboOptRequest = {
  sesUserId: string;
  userId: string;
  sqlProp: string;
  keyParam: string;
  ACCESS_TOKEN: string;
  sesLang: string;
};

export type commonResponse = {
  rows: [];
};

export const commonApi = {
  getCodesAndNames(payload: commonRequest) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/getCodeAndNames",
      payload,
    );
  },

  fetchComboOptions(payload: comboOptRequest[]) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/fetchComboOptions",
      payload,
    );
  },

  /**
   * 메뉴코드 기반 조회조건 메타 조회
   * (센차 /appService/getSerchConditionAndUserAuth → dsSearchCondition 대응)
   */
  fetchSearchCondition(menuCode: string, sesLang: string, userId: string) {
    return apiClient.post<{
      data: { dsSearchCondition: ServerSearchConditionRow[] };
    }>("/openapina/carrier/getSerchConditionAndUserAuth", {
      menuCode,
      sesLang,
      userId,
    });
  },
};
