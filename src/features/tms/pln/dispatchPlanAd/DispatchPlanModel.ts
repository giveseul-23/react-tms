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
  const base = useBaseModel<GridKey>(menuCode);

  const [unallocSearching, setUnallocSearching] = useState(false);

  const { codeMap } = useCommonStores({
    dspchOpSts: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    vehOpTp: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
  });

  return {
    ...base,
    unallocSearching,
    setUnallocSearching,
    codeMap,
  };
}

export type DispatchPlanModel = ReturnType<typeof useDispatchPlanModel>;
