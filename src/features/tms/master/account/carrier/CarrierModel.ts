import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "bank" | "comp";

export function useCarrierModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  const { codeMap } = useCommonStores({
      bankKey: { sqlProp: "CODE", keyParam: "BANK_KEY" },
      sapBusArea: { sqlProp: "CODE", keyParam: "SAP_BUS_AREA" },
    });
  
    return { ...base, codeMap };
}

export type CarrierModel = ReturnType<typeof useCarrierModel>;