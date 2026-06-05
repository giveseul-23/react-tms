import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "detail01" | "detail02";

export function useAccountReceivableSubChargeManagementModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  const { codeMap } = useCommonStores({
    xxxTcd: { sqlProp: "CODE", keyParam: "XXX_TCD" },
    yyyTcd: { sqlProp: "CODE", keyParam: "YYY_TCD" },
  });

  return { ...base, codeMap };
}

export type AccountReceivableSubChargeManagementModel = ReturnType<
  typeof useAccountReceivableSubChargeManagementModel
>;
