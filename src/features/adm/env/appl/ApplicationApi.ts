import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";

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

export const applicationApi = {
  getApplicationList(menuCd: string, payload: any) {
    return apiClient.post<CommonResponse>(
      "/applicationService/search",
      withSession({ MENU_CD: menuCd, ...payload }),
    );
  },

  saveApplication(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post(
      "/applicationService/save",
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          ...rest,
        },
      },
    );
  },
};
