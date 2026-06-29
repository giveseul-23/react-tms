import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./LoadingRateStatus";

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

// 서비스 base: /loadingRateStatusService (서버 LoadingRateStatusModel proxy url)
export const loadingRateStatusApi = {
  // 메인(일자별 적재율) 조회
  getMainList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/loadingRateStatusService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 차량유형별 요약 조회
  getSub01List(payload: any) {
    return apiClient.post<CommonResponse>(
      `/loadingRateStatusService/searchVehTp`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 차량단위 상세 조회
  getSub02List(payload: any) {
    return apiClient.post<CommonResponse>(
      `/loadingRateStatusService/searchVeh`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 전체 데이터 조회 (엑셀 "조회된모든데이터" 용)
  getAllData(payload: any) {
    return apiClient.post<CommonResponse>(
      `/loadingRateStatusService/searchAllData`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 차량유형/적재기준 메타 (메인 동적 컬럼 생성용)
  getVehTpLgst(payload: any) {
    return apiClient.post<CommonResponse>(
      `/loadingRateStatusService/searchVehTpLgst`,
      withSession({ MENU_CD: MENU_CODE, module: "TMS", ...payload }),
    );
  },
};
