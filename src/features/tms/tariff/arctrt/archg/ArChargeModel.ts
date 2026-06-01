import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useArChargeModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    arChgTpList: { sqlProp: "CODE", keyParam: "AR_CHG_TCD" },
    chgSignTpList: { sqlProp: "CODE", keyParam: "CHG_SIGN_TP" },
    taxTcdList: { sqlProp: "CODE", keyParam: "TAX_TCD" },
  });

  return { ...base, codeMap };
}

export type ArChargeModel = ReturnType<
  typeof useArChargeModel
>;
