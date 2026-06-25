import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "detail";

export function useContainerModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    flexQty: { sqlProp: "CODE", keyParam: "FLEX_QTY" },
  });

  return { ...base, codeMap };
}

export type ContainerModel = ReturnType<typeof useContainerModel>;
