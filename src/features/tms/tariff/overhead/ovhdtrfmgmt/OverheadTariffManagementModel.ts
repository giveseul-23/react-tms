import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "subChg" | "subChgDtl";

export function useOverheadTariffManagementModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    ovrhdChgType: { sqlProp: "CODE", keyParam: "OVRHD_CHG_TP" },
  });

  return { ...base, codeMap };
}

export type OverheadTariffManagementModel = ReturnType<
  typeof useOverheadTariffManagementModel
>;
