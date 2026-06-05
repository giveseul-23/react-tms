import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CD } from "./ParameterConfiguration";

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

export const parameterConfigurationApi = {
  getParameterConfigurationList(menuCd: string, payload: any) {
    return apiClient.post<CommonResponse>(
      "/parameterConfigurationService/search",
      withSession({ MENU_CD: menuCd, ...payload }),
    );
  },

  saveParameterConfiguration(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post(
      "/parameterConfigurationService/save",
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

  reloadServiceUtil(payload: any) {
    const { dsSave = [], ...rest } = payload ?? {};
    return apiClient.post(
      "/parameterConfigurationService/reLoadServiceUtil",
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
