import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "sub01";

export function useItineraryModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    ynList: { sqlProp: "CODE", keyParam: "YN" },
  });

  return { ...base, codeMap };
}

export type ItineraryModel = ReturnType<typeof useItineraryModel>;
