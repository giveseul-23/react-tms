import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./DivisionSto";

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

export const divisionStoApi = {
  getList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/divisionStoService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  getDetailList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/divisionStoService/searchDetail",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  saveDetail(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/divisionStoService/saveDetail",
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
