import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./OrderMonitor";

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

// 서버: vc.view.mdl.tms.execution.ordermonitor (orderMonitorService) — 조회 전용 모니터링
export const orderMonitorApi = {
  // 운송주문(main)
  getMainList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/orderMonitorService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 비용계산식(sub01)
  getSub01List(payload: any) {
    return apiClient.post<CommonResponse>(
      `/orderMonitorService/searchCostInfoList`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 비용조건(sub02) — 서버 활성 url: searchApPlanList
  getSub02List(payload: any) {
    return apiClient.post<CommonResponse>(
      `/orderMonitorService/searchApPlanList`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
