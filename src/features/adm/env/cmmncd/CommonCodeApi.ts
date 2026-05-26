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

export const commonCodeApi = {
  getCommonCodeList(menuCd: string, payload: any) {
    return apiClient.post<CommonResponse>(
      "/commonCodeService/search",
      withSession({
        MENU_CD: menuCd,
        ...payload,
      }),
    );
  },

  getCommonCodeDetailList(menuCd: string, payload: any) {
    return apiClient.post<CommonResponse>(
      "/commonCodeService/searchDetail",
      withSession({
        MENU_CD: menuCd,
        ...payload,
      }),
    );
  },

  getCommonCodeLangList(menuCd: string, payload: any) {
    return apiClient.post<CommonResponse>(
      "/commonCodeService/searchDetailLang",
      withSession({
        MENU_CD: menuCd,
        ...payload,
      }),
    );
  },

  saveCommonCodeInfo(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post(
      "/commonCodeService/saveCommonCodeInfo",
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          ...rest,
        },
      },
    );
  },

  saveDetailCommonCode(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post(
      "/commonCodeService/saveDetailCommonCode",
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          ...rest,
        },
      },
    );
  },

  saveDetailLangCommonCode(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post(
      "/commonCodeService/saveDetailLangCommonCode",
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          ...rest,
        },
      },
    );
  },

  reorderDisplaySequence(menuCd: string) {
    return apiClient.post(
      "/commonCodeService/updateReorderDisplaySequence",
      {},
      {
        params: {
          ...getSessionFields(),
          MENU_CD: menuCd,
        },
      },
    );
  },
};
