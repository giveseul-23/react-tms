import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./FreightCostAggregation";

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

// 서버 FreightCostAggregationModel proxy + Controller URL 기준.
export const freightCostAggregationApi = {
  // 메인 조회 (FreightCostAggregationModel mainInfo proxy)
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/freightCostAggregationService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 동적 BODY 컬럼 메타 (요금코드) — 서버 getBodyColumnList
  getChargeCode(payload: any) {
    return apiClient.post<CommonResponse>(
      `/apSettlMgmtService/getChargeCodeCfWithoutLgst`,
      withSession({
        module: "TMS",
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  // 물류운영그룹별 차량 콤보 (조회조건 SRCH_DSP_VEH_ID 옵션)
  searchLgstVeh(payload: any) {
    return apiClient.post<CommonResponse>(
      `/freightCostAggregationService/searchLgstVeh`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
