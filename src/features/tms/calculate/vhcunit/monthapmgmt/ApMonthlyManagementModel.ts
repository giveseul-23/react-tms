import { useState, useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";
import { MAIN_COLUMN_DEFS } from "./ApMonthlyManagementColumns";

export type GridKey = "main";

export function useApMonthlyManagementModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 동적 컬럼
  const [mainColumnDefs, setMainColumnDefs] =
    useState<any[]>(MAIN_COLUMN_DEFS);

  const { stores } = useCommonStores({
    vehicleFinStatus: { sqlProp: "CODE", keyParam: "VEH_FI_STS" },
    vehTempTcd: { sqlProp: "CODE", keyParam: "VEH_TEMP_TCD" },
    driverWorkStatus: { sqlProp: "CODE", keyParam: "DRIVER_WORK_STATUS" },
    fiStsList: { sqlProp: "CODE", keyParam: "AP_FI_STS" },
  });

  const codeMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    Object.entries(stores).forEach(([storeKey, items]) => {
      map[storeKey] = {};
      (items ?? []).forEach((item: any) => {
        map[storeKey][item.CODE] = item.NAME;
      });
    });
    return map;
  }, [stores]);

  return { ...base, mainColumnDefs, setMainColumnDefs, codeMap };
}

export type ApMonthlyManagementModel = ReturnType<
  typeof useApMonthlyManagementModel
>;
