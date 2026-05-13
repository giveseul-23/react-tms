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
  getCommodityList(menuCd: string, payload: any) {
    return apiClient.post<CommonResponse>(
      "/commodityService/search",
      withSession({ MENU_CD: menuCd, ...payload }),
    );
  },

  save(payload: any) {
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
