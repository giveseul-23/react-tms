import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./CarrierByLogistic";

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

// 물류운영그룹
export const carrierByLogisticApi = {
  getLogisticsList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/logisticGroupCarrierService/search",
      withSession({ MENU_CD: MENU_CODE, DIV_CD: payload.DIV_CD, LGST_GRP_CD: payload.LGST_GRP_CD }),
    );
  },


  getLogisticCarrierInfoList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/logisticGroupCarrierService/searchLgstCarr",
      withSession({ MENU_CD: MENU_CODE, DIV_CD: payload.DIV_CD, LGST_GRP_CD: payload.LGST_GRP_CD }),
    );
  },

  saveLogisticCarrierInfo(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/logisticGroupCarrierService/saveLgstCarr",
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          MENU_CD: MENU_CODE,
          ...rest,
        },
      },
    );
  },


  // 물류운영그룹 운송사 상세 정보
  getLogisticCarrierDetailInfoList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/logisticGroupCarrierService/searchLgstCarrEmail",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  saveLogisticCarrierDetail(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/logisticGroupCarrierService/saveLgstCarrEmail",
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          MENU_CD: MENU_CODE,
          ...rest,
        },
      },
    );
  },

};
