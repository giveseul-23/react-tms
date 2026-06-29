import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useStoShipmentManagementModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  const { stores, codeMap } = useCommonStores({
    spclPrcsCd: { module: "TMS", sqlProp: "CODE", keyParam: "SPCL_PRCS_CD" },
    shpmOpStsList: { module: "TMS", sqlProp: "CODE", keyParam: "SHPM_OP_STS" },
  });

  return { ...base, stores, codeMap };
}

export type StoShipmentManagementModel = ReturnType<
  typeof useStoShipmentManagementModel
>;
