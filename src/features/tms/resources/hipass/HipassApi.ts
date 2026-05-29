import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./Hipass";

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

export const hipassApi = {
  getList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/hipassService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }));
  },

  searchOne(payload: { HIPASS_ID: string | number }) {
    return apiClient.post<CommonResponse>(
      "/hipassService/searchOne",
      withSession({
        MENU_CD: MENU_CODE,
        HIPASS_ID: payload.HIPASS_ID,
        rowStatus: "S"
      }),
    );
  },

  save(payload: { dsSave: any[] }) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/hipassService/save",
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
