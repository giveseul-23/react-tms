import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "sub01" | "sub02";

export function useAccountReceivableChargeModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  const { codeMap } = useCommonStores({
    supersedeTpList: { sqlProp: "CODE", keyParam: "SUPERSEDE_TP" },
    rdngRcdList: { sqlProp: "CODE", keyParam: "RDNG_RCD" },
    ynList: { sqlProp: "CODE", keyParam: "YN" },
    arTrfLevelList: { sqlProp: "CODE", keyParam: "AR_TRF_LCD" },
  });

  return {
    ...base,
    codeMap,
  };
}

export type AccountReceivableChargeModel = ReturnType<
  typeof useAccountReceivableChargeModel
>;
