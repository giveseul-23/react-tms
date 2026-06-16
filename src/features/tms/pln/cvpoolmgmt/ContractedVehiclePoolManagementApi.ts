import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./ContractedVehiclePoolManagement";

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

// TODO: 서비스 경로(/contractedVehiclePoolManagementService) 를 실제 백엔드 스펙에 맞춰 교체.
export const contractedVehiclePoolManagementApi = {
  getList(menuCd: string, payload: any) {
    return apiClient.post<CommonResponse>(
      `/contractedVehiclePoolManagementService/search`,
      withSession({ MENU_CD: menuCd, ...payload }),
    );
  },

  save(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      `/contractedVehiclePoolManagementService/save`,
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
