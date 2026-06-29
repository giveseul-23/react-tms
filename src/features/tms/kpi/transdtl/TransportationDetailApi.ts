import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./TransportationDetail";

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

// 서버: vc.view.mdl.tms.kpi.transdtl — proxy url /transportationDetailService/search (조회 전용 inquiry)
export const transportationDetailApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/transportationDetailService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
