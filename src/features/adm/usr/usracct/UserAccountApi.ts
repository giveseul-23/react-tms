import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";

const MENU_CD = "MENU_USER_ACCOUNT";

type CommonResponse = {
  rows: [];
};

const withSession = (payload: Record<string, unknown> = {}) => ({
  ...getSessionFields(),
  MENU_CD,
  ...payload,
});

const postDsSave = (url: string, payload: any) => {
  const { dsSave, ...rest } = payload ?? {};
  return apiClient.post<CommonResponse>(
    url,
    { dsSave },
    {
      params: {
        ...getSessionFields(),
        MENU_CD,
        ...rest,
      },
    },
  );
};

export const userAccountApi = {
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/userAccountService/search",
      withSession(payload),
    );
  },

  getUserGroupList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/userAccountService/searchUserGroup",
      withSession(payload),
    );
  },

  getAllRoleList(payload: any = {}) {
    return apiClient.post<CommonResponse>(
      "/userAccountService/searchAllRoleList",
      withSession(payload),
    );
  },

  getUserRoleTree(payload: any) {
    return apiClient.post<any>(
      "/userAccountService/searchUserRole",
      withSession(payload),
    );
  },

  getUserAccountPopupList(payload: any) {
    return apiClient.post<CommonResponse>(
      "/userAccountService/searchUserAccountPop",
      withSession(payload),
    );
  },

  save(payload: { dsSave: any[] }) {
    return postDsSave("/userAccountService/save", payload);
  },

  saveUserGroupRole(payload: { dsSave: any[] }) {
    return postDsSave("/userAccountService/saveUserGroupRole", payload);
  },

  saveUserRole(payload: { dsSave: any[]; AUTH_COLUMNS: string }) {
    return postDsSave("/userAccountService/saveUserRole", payload);
  },

  saveUserPhoneNumber(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/userAccountService/saveUserPhoneNumber",
      withSession(payload),
    );
  },

  removeAllRoles(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/userAccountService/removeAllRoles",
      withSession(payload),
    );
  },

  importAllGroupRoles(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/userAccountService/importAllGroupRoles",
      withSession(payload),
    );
  },

  reloadMenuCache(payload: Record<string, unknown> = {}) {
    return apiClient.post<CommonResponse>(
      "/menuMgmtCacheService/resetMenuData",
      withSession(payload),
    );
  },
};
