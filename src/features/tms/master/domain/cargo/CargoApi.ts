import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./Cargo.tsx";

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

export const cargoApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/cargoService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  save(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      `/cargoService/save`,
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

  remove(payload: any) {
    return apiClient.post<CommonResponse>(
      `/cargoService/delete`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
