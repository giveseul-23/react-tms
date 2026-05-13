import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function usePlantModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    invSysList: { sqlProp: "CODE", keyParam: "HARIM_INV_SYS_ID" },
  });

  return { ...base, codeMap };
}

export type PlantModel = ReturnType<typeof usePlantModel>;
