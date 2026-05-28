"use client";

import { useState } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { MENU_CD } from "./RoleResourcesByUserGroupManagementApi";

export type GridKey = "main" | "sub01";

export type RoleResourceTreeRow = {
  id: string;
  parentId: string | null;
  level: number;
  RSRC_ID: string;
  RSRC_DESC?: string;
  MSG_DESC?: string;
  RSRC_TP?: string;
  PRNT_RSRC_ID?: string;
  RL_CNFG_VAL?: string;
  AUTH_TOTAL?: boolean | string;
  DEL_AUTH_INFO?: boolean | string;
  S_COLUMN?: boolean | string;
  E_COLUMN?: boolean | string;
  C_COLUMN?: boolean | string;
  U_COLUMN?: boolean | string;
  D_COLUMN?: boolean | string;
  P_COLUMN?: boolean | string;
  I_COLUMN?: boolean | string;
  CRE_USR_ID?: string;
  CRE_DTTM?: string;
  USR_GRP_CD?: string;
  RL_CD?: string;
  LEAFYN?: string;
  rowStatus?: string;
  EDIT_STS?: string;
  __rid__?: string;
};

export function useRoleResourcesByUserGroupManagementModel() {
  const base = useBaseModel<GridKey>(MENU_CD, { pageSize: 500 });
  const [roleTreeRows, setRoleTreeRows] = useState<RoleResourceTreeRow[]>([]);

  return {
    ...base,
    roleTreeRows,
    setRoleTreeRows,
  };
}

export type RoleResourcesByUserGroupManagementModel = ReturnType<
  typeof useRoleResourcesByUserGroupManagementModel
>;
