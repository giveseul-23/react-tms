import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
const MENU_CD = "MENU_USER_GROUP";

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

export const userGroupApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/userGroupService/search",
      withSession({ MENU_CD, ...payload }),
    );
  },

  getGroupApplicationList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/userGroupService/searchGroupApplcation",
      withSession({ MENU_CD, ...payload }),
    );
  },

  getUserAccountList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/userGroupService/searchUserAccount",
      withSession({ MENU_CD, ...payload }),
    );
  },

  getUserGroupRoleList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/userGroupService/searchUserGroupRole",
      withSession({ MENU_CD, ...payload }),
    );
  },

  getUserAccountPopupList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/userAccountService/searchUserAccountPop",
      withSession({ MENU_CD, ...payload }),
    );
  },

  save(payload: { dsSave: any[] }) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/userGroupService/userGroupSave",
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          ...rest,
        },
      },
    );
  },

  saveGroupApplication(payload: { dsSave: any[] }) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/userGroupService/saveGroupApplication",
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          ...rest,
        },
      },
    );
  },

  saveUserAccount(payload: { dsSave: any[] }) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/userGroupService/saveUserAccount",
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          ...rest,
        },
      },
    );
  },

  saveUserGroupRole(payload: { dsSave: any[] }) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      "/userGroupService/saveUserGroupRole",
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
