import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useStoShipmentDispatchModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    dspchOpSts: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    orderTp: { sqlProp: "CODE", keyParam: "ORD_TP" },
  });

  return { ...base, codeMap };
}

export type StoShipmentDispatchModel = ReturnType<
  typeof useStoShipmentDispatchModel
>;
