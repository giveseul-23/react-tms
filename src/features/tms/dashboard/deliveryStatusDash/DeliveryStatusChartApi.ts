import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./DeliveryStatusChart";

// 서버 응답: { dsOut: { DM_TOTAL_DSPCH_COUNT, DM_DF_VEH_*, DP_*, SP_* ... } } (단일 집계 row)
type ChartResponse = {
  dsOut?: Record<string, number | string | null>;
};

const withSession = (payload: any = {}) => ({ ...getSessionFields(), ...payload });

// 서버 대응: DeliveryStatusChartController.chartDraw → callAjax('/chartService/search', params)
//   params: DIV_CD(사업부) / LGST_GRP_CD(물류운영그룹) /
//           FRM_DLVRY_DT~TO_DLVRY_DT(배송일 범위) / MENU_CD
export const deliveryStatusChartApi = {
  search(payload: any) {
    return apiClient.post<ChartResponse>(
      `/chartService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
