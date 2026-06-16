import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./BoxApMgmt";

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

// TODO: 서비스 경로(/boxApMgmtService) 를 실제 백엔드 스펙에 맞춰 교체.
export const boxApMgmtApi = {
  getList(menuCd: string, payload: any) {
    return apiClient.post<CommonResponse>(
      `/boxApMgmtService/search`,
      withSession({ MENU_CD: menuCd, ...payload }),
    );
  },

  save(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      `/boxApMgmtService/save`,
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
