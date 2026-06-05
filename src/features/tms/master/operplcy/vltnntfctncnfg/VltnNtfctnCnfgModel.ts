import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "detail" | "channel" | "target";

export function useVltnNtfctnCnfgModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    vltnNtfctnTcd: { sqlProp: "CODE", keyParam: "VLTN_NTFCTN_TCD" },
    ntfctnChnlTcd: { sqlProp: "CODE", keyParam: "NTFCTN_CHNL_TCD" },
  });

  return { ...base, codeMap };
}

export type VltnNtfctnCnfgModel = ReturnType<typeof useVltnNtfctnCnfgModel>;
