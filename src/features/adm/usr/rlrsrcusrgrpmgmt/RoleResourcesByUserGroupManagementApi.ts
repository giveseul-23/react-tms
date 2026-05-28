import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";

export const MENU_CD = "MENU_ROLE_RSRC_USRGRP_MGMT";

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

export const roleResourcesByUserGroupManagementApi = {
  getUserGroupList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/roleResourcesByUserGroupManagementService/searchUserGroup",
      withSession(payload),
    );
  },

  getUserGroupRoleList(payload: Record<string, unknown>) {
    return apiClient.post<CommonResponse>(
      "/roleResourcesByUserGroupManagementService/searchUserGroupRole",
      withSession(payload),
    );
  },

  getRoleResourceTree(payload: Record<string, unknown>) {
    return apiClient.post<any>(
      "/roleResourcesByUserGroupManagementService/searchRoleResourceByUserGroup",
      withSession(payload),
    );
  },

  saveRoleResourceTree(payload: { dsSave: any[]; AUTH_COLUMNS: string }) {
    return postDsSave(
      "/roleResourcesByUserGroupManagementService/saveRoleResourceByUserGroup",
      payload,
    );
  },

  reloadMenuCache(payload: Record<string, unknown> = {}) {
    return apiClient.post<CommonResponse>(
      "/menuMgmtCacheService/resetMenuData",
      withSession(payload),
    );
  },
};
