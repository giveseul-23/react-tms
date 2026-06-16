import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./DspchContainer";

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

export const dspchContainerApi = {
  // 메인: 착지단위 배차 조회 (서버 mainInfo proxy /searchStop)
  getMainList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dspchContainerService/searchStop`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // sub01: 운송단위 입출고 수량 조회 (서버 sub01Info proxy /search)
  getSub01List(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dspchContainerService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // sub01 저장 (서버 saveUrl /save, dsSave 패턴)
  save(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      `/dspchContainerService/save`,
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
