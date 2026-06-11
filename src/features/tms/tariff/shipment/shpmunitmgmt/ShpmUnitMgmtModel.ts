import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useShpmUnitMgmtModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    itmUom: { sqlProp: "CODE", keyParam: "ITEM_UOM" },
    rdngRcdList: { sqlProp: "CODE", keyParam: "RDNG_RCD" },
  });

  return { ...base, codeMap };
}

export type ShpmUnitMgmtModel = ReturnType<typeof useShpmUnitMgmtModel>;
