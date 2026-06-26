import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./DspchContainerReport";

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

// 조회 전용 리포트 — 저장 없음. 탭별 3개 조회 엔드포인트.
export const dspchContainerReportApi = {
  // 일자별(byDay)
  searchLgstGrpCntr(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dspchContainer2Service/searchLgstGrpCntr`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getMainList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dspchContainerReportService/searchByDay`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 점포별(byLoc)
  getSub01List(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dspchContainerReportService/searchByLoc`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 차량별(byVeh)
  getSub02List(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dspchContainerReportService/searchByVeh`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
