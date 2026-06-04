import { apiClient } from "@/app/http/client";
import { getSessionFields, getUserGroup } from "@/app/services/auth/auth";
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
    }>("/appService/getSerchConditionAndUserAuth", {
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

  // ── Excel Service (공통 엑셀 다운로드 3단계) ──────────────────
  // 센차 ExGridEditor/ExTreeEditor 의 saveUserTempData → commonExcelDownPrepare
  // → commonExcelDown(iframe) 흐름을 React 로 포팅. 위젯별로 흩어져 있던 호출을
  // 이 공통 API 하나로 통일한다. 마지막 단계는 JWT Bearer 인증을 위해 iframe GET
  // 대신 apiClient blob GET 으로 받는다.

  /** 1단계 — 임시 데이터 저장. jsonData(=DS_JSONDATA) 는 body, 나머지는 query. */
  saveUserTempData(
    jsonData: Record<string, unknown>,
    params: Record<string, unknown> = {},
  ) {
    return apiClient.post("/downloaderService/saveUserTempData", jsonData, {
      params: { ...getSessionFields(), ...params },
    });
  },

  /** 2단계 — 다운로드 준비 (센차: userLang/sesUserGroup/sesUserId/MENU_CD).
   *  EXCEL_INFO/SEARCH_URL 은 1단계에서 저장된 세션(PARAM_MAP)에서 서버가 읽으므로 여기선 안 보냄. */
  commonExcelDownPrepare(menuCd: string) {
    const session = getSessionFields();
    return apiClient.post(
      "/downloaderService/commonExcelDownPrepare",
      {},
      {
        params: {
          ...session,
          userLang: session.sesLang,
          sesUserGroup: getUserGroup() ?? "",
          MENU_CD: menuCd,
        },
      },
    );
  },

  /** 3단계 — 파일 스트림 다운로드 (blob). */
  downloadCommonExcel(menuCd: string) {
    return apiClient.get("/downloaderService/commonExcelDown", {
      params: { ...getSessionFields(), MENU_CD: menuCd },
      responseType: "blob",
    });
  },
};
