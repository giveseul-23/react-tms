import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";

export const MENU_CD = "MENU_UI_RSRC_MGMT";

type CommonResponse = {
  rows: [];
};

const withSession = (payload: any = {}) => ({
  ...getSessionFields(),
  MENU_CD,
  ...payload,
});

export const uiResourceApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/resourceManageService/search",
      withSession(payload),
    );
  },

  save(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post(
      "/resourceManageService/save",
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

