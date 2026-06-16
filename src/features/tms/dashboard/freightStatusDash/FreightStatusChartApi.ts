import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./FreightStatusChart";

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();
  return { ...sessionFields, ...payload };
};

// 서버 대응: FreightStatusChartController.js chartDraw → callAjax('/freightChartService/search', ...)
//   응답 record.data.dsOut[<dataIndex>] (단일 KPI row). 저장 API 없음(조회 전용 대시보드).
type FreightSearchParams = {
  DIV_CD?: string;
  LGST_GRP_CD?: string;
  FRM_DLVRY_DT?: string;
  TO_DLVRY_DT?: string;
};

export const freightStatusChartApi = {
  // KPI 카드 6 + 세로막대 2 의 원천 데이터. dsOut 의 KPI 필드를 차트 옵션에 매핑(TODO: 차트 lib).
  search(params: FreightSearchParams) {
    return apiClient.post(
      `/freightChartService/search`,
      withSession({ ...params, MENU_CD: MENU_CODE }),
    );
  },
};
