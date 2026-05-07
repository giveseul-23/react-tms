import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "detail01" | "detail02";

export function useAccountReceivableSubChargeManagementModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  const { stores } = useCommonStores({
    xxxTcd: { sqlProp: "CODE", keyParam: "XXX_TCD" },
    yyyTcd: { sqlProp: "CODE", keyParam: "YYY_TCD" },
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

  return { ...base, codeMap };
}

export type AccountReceivableSubChargeManagementModel = ReturnType<
  typeof useAccountReceivableSubChargeManagementModel
>;
