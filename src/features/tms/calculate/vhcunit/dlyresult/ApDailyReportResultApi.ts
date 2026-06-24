import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./ApDailyReportResult";

type CommonResponse = {
  rows: any[];
};

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();
  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }
  return { ...sessionFields, ...payload };
};

// 센차 saveRecord 대응: body { dsSave: [...] }, params 에 세션/MENU_CD
const saveRecord = (url: string, dsSave: any[], params: any = {}) =>
  apiClient.post<CommonResponse>(
    url,
    { dsSave },
    {
      params: {
        ...getSessionFields(),
        MENU_CD: MENU_CODE,
        ...params,
      },
    },
  );

export const apDailyReportResultApi = {
  // 메인 조회
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/apDailyReportResultService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 차량일일실적추가 (선택 행 → rowStatus 'U' 로 저장)
  createDailyApVehUnit(rows: any[], params: any = {}) {
    return saveRecord(
      `/apDailyReportResultService/createDailyApVehUnit`,
      rows,
      params,
    );
  },

  // 차량일일실적삭제(취소)
  cancelDailyApVehUnit(rows: any[], params: any = {}) {
    return saveRecord(
      `/apDailyReportResultService/cancelDailyApVehUnit`,
      rows,
      params,
    );
  },

  // AP 시작일 조회 (센차 getApStartDate → /apSettlMgmtService/searchApStartDay)
  searchApStartDay() {
    return apiClient.post<CommonResponse>(
      `/apSettlMgmtService/searchApStartDay`,
      withSession({ MENU_CD: MENU_CODE }),
    );
  },
};
