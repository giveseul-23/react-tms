import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CD } from "@/features/adm/menu/srchCond/SearchCondition";

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

export const searchConditionApi = {
  getList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/searchConditionService/search",
      withSession({ MENU_CD, ...payload }),
    );
  },

  save(payload: { dsSave: unknown[] } & Record<string, unknown>) {
    const { dsSave, ...rest } = payload ?? {};

    return apiClient.post(
      "/searchConditionService/save",
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          MENU_CD,
          ...rest,
        },
      },
    );
  },
};
