import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CD } from "@/features/tms/master/domain/commodity/Commodity";

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

export const commodityApi = {
  getCommodityList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/commodityService/search",
      withSession({ MENU_CD: MENU_CD, ...payload }),
    );
  },

  saveCommodityList(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/commodityService/save",
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
