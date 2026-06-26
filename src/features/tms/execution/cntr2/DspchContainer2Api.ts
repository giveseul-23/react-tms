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
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dspchContainer2Service/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  searchLgstGrpCntr(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dspchContainer2Service/searchLgstGrpCntr`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

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

  searchTempTonGroupToChange(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dispatchPlanVehService/searchTempTonGroupToChange`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  searchVehicleTypeToChange(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dispatchPlanVehService/searchVehicleTypeToChange`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
