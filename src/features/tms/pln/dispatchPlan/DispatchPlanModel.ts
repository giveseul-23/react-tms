// src/views/dispatchPlan/DispatchPlanModel.ts
import { useState, useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey =
  | "main"
  | "stop"
  | "allocOrder"
  | "unallocOrder"
  | "allocSub"
  | "unallocSub";

export function useDispatchPlanModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  const [unallocSearching, setUnallocSearching] = useState(false);

  const { stores } = useCommonStores({
    dspchOpSts: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    vehOpTp: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
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

  return {
    ...base,
    unallocSearching,
    setUnallocSearching,
    codeMap,
  };
}

export type DispatchPlanModel = ReturnType<typeof useDispatchPlanModel>;
