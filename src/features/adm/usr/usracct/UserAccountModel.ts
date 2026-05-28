"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "sub01" | "sub03";

export type RoleTreeRow = {
  id: string;
  parentId: string | null;
  level: number;
  RSRC_ID: string;
  RSRC_DESC?: string;
  RL_CNFG_VAL?: string;
  RL_CD?: string;
  USR_ID?: string;
  RSRC_TP?: string;
  LEAFYN?: string;
  AUTH_TOTAL?: boolean | string;
  DEL_AUTH_INFO?: boolean | string;
  S_COLUMN?: boolean | string;
  E_COLUMN?: boolean | string;
  C_COLUMN?: boolean | string;
  U_COLUMN?: boolean | string;
  D_COLUMN?: boolean | string;
  P_COLUMN?: boolean | string;
  I_COLUMN?: boolean | string;
  EDIT_STS?: string;
  CRE_USR_ID?: string;
  CRE_DTTM?: string;
  __rid__?: string;
  rowStatus?: string;
};

export function useUserAccountModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { pageSize: 500 });
  const [roleTreeRows, setRoleTreeRows] = useState<RoleTreeRow[]>([]);
  const [themeRows, setThemeRows] = useState<Array<{ CODE: string; NAME: string }>>([
    { CODE: "DEFAULT", NAME: "DEFAULT" },
  ]);

  const { stores, codeMap } = useCommonStores({
    dayType: { module: "TMS", sqlProp: "CODE", keyParam: "DAY_TP" },
    dateFrmtType: { module: "TMS", sqlProp: "CODE", keyParam: "DT_FRMT_TP" },
    timeFrmtType: { module: "TMS", sqlProp: "CODE", keyParam: "TM_FRMT_TP" },
    custList: { module: "TMS", sqlProp: "selectCustomerCodeNameAll" },
    timezoneStore: { sqlProp: "/tmsCommonService/searchTimzones" },
  });

  useEffect(() => {
    let cancelled = false;

    async function loadThemes() {
      try {
        const res: any = await apiClient.post(
          "/userThemeService/getUserThemeList",
          {
            ...getSessionFields(),
            USR_THEME_ROOT_PATH: "/resources",
          },
        );
        const list = res?.data?.data?.USR_THEME;
        if (!cancelled && Array.isArray(list) && list.length > 0) {
          setThemeRows(list);
        }
      } catch (e) {
        console.error("[useUserAccountModel] theme load failed", e);
      }
    }

    void loadThemes();
    return () => {
      cancelled = true;
    };
  }, []);

  const mergedCodeMap = useMemo(() => {
    const themeMap = Object.fromEntries(
      themeRows.map((item) => [item.CODE, item.NAME]),
    );
    return {
      ...codeMap,
      themeList: themeMap,
    };
  }, [codeMap, themeRows]);

  return {
    ...base,
    stores: {
      ...stores,
      themeList: themeRows,
    },
    codeMap: mergedCodeMap,
    roleTreeRows,
    setRoleTreeRows,
  };
}

export type UserAccountModel = ReturnType<typeof useUserAccountModel>;
