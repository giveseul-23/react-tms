import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./StoShipmentDispatch";

type CommonResponse = {
  rows: any[];
};

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();
  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }
  return { ...sessionFields, ...payload };
};

const dsSavePost = (url: string, rows: any[], params: Record<string, any> = {}) =>
  apiClient.post<CommonResponse>(
    url,
    { dsSave: rows },
    {
      params: {
        ...getSessionFields(),
        MENU_CD: MENU_CODE,
        ...params,
      },
    },
  );

export const stoShipmentDispatchApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/stoShipmentDispatchService/search",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  save(payload: { dsSave: any[] }) {
    return dsSavePost("/stoShipmentDispatchService/save", payload.dsSave ?? []);
  },
};
