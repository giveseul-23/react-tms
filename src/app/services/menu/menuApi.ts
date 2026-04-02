import { apiClient } from "@/app/api/client";
import { getSessionFields } from "@/app/services/auth/auth";

type commonResponse = {
  rows: [];
};

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();

  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }

  return { ...sessionFields, ...payload };
};

export const menuApi = {
  getMenuConfigList(payload: any) {
    return apiClient.post<commonResponse>(
      `/openapina/carrier/getMenuConfigList`,
      withSession(payload),
    );
  },
};
