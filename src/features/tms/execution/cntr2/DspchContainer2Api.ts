import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./DspchContainer2";

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

export const dspchContainer2Api = {
  // 조회 (서버 mainInfo proxy /dspchContainer2Service/search)
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dspchContainer2Service/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 저장 (서버 saveUrl /dspchContainer2Service/save, dsSave 패턴)
  save(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      `/dspchContainer2Service/save`,
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

  // 톤급변경 팝업 — 차량 톤그룹 조회 (서버 /dispatchPlanVehService/searchTempTonGroupToChange)
  searchTempTonGroupToChange(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dispatchPlanVehService/searchTempTonGroupToChange`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 톤급변경 팝업 — 톤급 조회 (서버 /dispatchPlanVehService/searchVehicleTypeToChange)
  searchVehicleTypeToChange(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dispatchPlanVehService/searchVehicleTypeToChange`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
