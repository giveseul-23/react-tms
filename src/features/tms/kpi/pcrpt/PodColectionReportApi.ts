import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./PodColectionReport";

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

// 읽기전용 리포트 — 조회 3종(서버 podColectionReportService).
export const podColectionReportApi = {
  // 물류운영그룹단위 조회
  getMainList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/podColectionReportService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 일자별 회수현황 조회
  getSub01List(payload: any) {
    return apiClient.post<CommonResponse>(
      `/podColectionReportService/searchPodCollectionStatusByDate`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 인수증 상세 조회
  getSub02List(payload: any) {
    return apiClient.post<CommonResponse>(
      `/podColectionReportService/searchPodInfomation`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
