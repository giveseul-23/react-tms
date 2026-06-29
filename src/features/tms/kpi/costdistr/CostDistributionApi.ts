import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./CostDistribution";

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

// 서비스 base: /costDistributionService (서버 CostDistributionModel proxy url 기준)
export const costDistributionApi = {
  // 주문단위 조회 (proxy url: /costDistributionService/search)
  getMainList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/costDistributionService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 품목단위 조회 (proxy url: /costDistributionService/searchDetail)
  getSub01List(payload: any) {
    return apiClient.post<CommonResponse>(
      `/costDistributionService/searchDetail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
