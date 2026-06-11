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

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();
  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }
  return { ...sessionFields, ...payload };
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
      data: {
        dsSearchCondition: ServerSearchConditionRow[];
        // 리소스 권한 행 — 모든 그룹 매트릭스. USR_GRP_CD 로 내 그룹만 필터.
        dsUserMenuAuth?: Array<{
          RSRC_ID: string;
          RSRC_TP?: string;
          CONCAT_CNFG_VAL?: string | number;
          USR_GRP_CD?: string;
        }>;
      };
    }>(
      "/appService/getSerchConditionAndUserAuth",
      { menuCode, sesLang, userId },
      {
        // 그룹별 권한은 서버가 쿼리 params 에서 읽음(센차 callAjax 동일). body 만으론 *DFT 폴백.
        params: {
          ...getSessionFields(),
          sesUserGroup: getUserGroup() ?? "",
          menuCode,
        },
      },
    );
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

  //우편번호조회
  searchTariffVehicleTypeList(payload: any) {
    return apiClient.post<commonResponse>(
      `/addressSearchService/search`,
      withSession({ MENU_CD: "MENU_ADDRESS_POP", ...payload }),
    );
  },
  getAreaCode(payload: any) {
    return apiClient.post<commonResponse>(
      `/addressSearchService/getAreaCode`,
      withSession({ MENU_CD: "MENU_ADDRESS_POP", ...payload }),
    );
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

  // ── 공통 업로더 (센차 gridExcelUpload / gridExcelTemplateDownload) ──────
  // 업로드 대상 그리드는 GRID_ID(=센차 grid.authId)로 구분된다.

  /** 엑셀 업로드 — multipart. UPLOAD_FILE/MENU_CD/GRID_ID/JSON_READ_PASS + 세션. */
  uploadCommonExcel(opts: {
    file: File;
    menuCode: string;
    gridId?: string;
    url?: string;
  }) {
    const form = new FormData();
    form.append("UPLOAD_FILE", opts.file);
    form.append("MENU_CD", opts.menuCode);
    if (opts.gridId) form.append("GRID_ID", opts.gridId);
    form.append("JSON_READ_PASS", "Y");
    Object.entries(getSessionFields()).forEach(([k, v]) =>
      form.append(k, String(v ?? "")),
    );
    return apiClient.post(opts.url ?? "/uploaderService/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /** 엑셀 업로드 양식 다운로드 — blob (MENU_CD=화면 menuCode, GRID_ID=grid authId). */
  downloadExcelTemplate(opts: { menuCode: string; gridId?: string }) {
    return apiClient.get("/uploaderService/downloadTemplate", {
      params: {
        ...getSessionFields(),
        MENU_CD: opts.menuCode,
        ...(opts.gridId ? { GRID_ID: opts.gridId } : {}),
      },
      responseType: "blob",
    });
  },
};
