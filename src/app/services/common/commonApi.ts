import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import type { ServerSearchConditionRow } from "@/features/search/search.meta.types";

export type commonRequest = {
  sesUserId: string;
  userId: string;
  sqlProp: string;
  ACCESS_TOKEN: string;
};

export type comboOptRequest = {
  key: string;
  sesUserId: string;
  userId: string;
  ACCESS_TOKEN: string;
  sqlProp: string;
  keyParam: string;
  sesLang: string;
};

export type commonResponse = {
  rows: [];
};

export const commonApi = {
  /**
   * 코드 조회 — ExtJS Ext.Ajax.request 의 { params, jsonData } 분리 패턴:
   *   - URL 쿼리 (axios `params`) → 서버 PARAM_MAP (세션 필드 자동 부착)
   *   - JSON body                   → valueChainData.map.dsCode (List<row>)
   *
   * dsCode 는 단일 row 객체 또는 row 배열 모두 허용 (자동으로 배열로 감쌈).
   */
  getCodesAndNames(
    dsCode: Record<string, any> | Record<string, any>[],
    params: Record<string, any> = {},
  ) {
    return apiClient.post<commonResponse>(
      "/appService/getCodesAndNames",
      { dsCode: Array.isArray(dsCode) ? dsCode : [dsCode] },
      { params: { ...getSessionFields(), ...params } },
    );
  },

  fetchComboOptions(payload: commonRequest[]) {
    return apiClient.post<commonResponse>("/appService/getCodesAndNames", {
      dsCode: payload,
    });
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

  /**
   * 모듈 기본값 조회
   * (센차 setModuleDefaultValue → /tmsCommonService/searchDefaultValue 대응)
   *
   * 응답 형태: dsOut[0] = { DIV_CD: "MVC^SPLT^모비어스", LGST_GRP_CD: "MV01^SPLT^MV_백암센터", ... }
   */
  fetchModuleDefaultValue(
    module: string,
    params: Record<string, unknown> = {},
  ) {
    const urls: Record<string, string> = {
      TMS: "/tmsCommonService/searchDefaultValue",
    };
    const url = (params.url as string) || urls[module];
    return apiClient.post(url, { ...getSessionFields(), ...params });
  },
};
