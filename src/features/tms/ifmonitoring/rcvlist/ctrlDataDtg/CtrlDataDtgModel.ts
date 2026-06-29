import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useCtrlDataDtgModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    interfaceStatus: { sqlProp: "CODE", keyParam: "IF_PRCS_STS" },
    vehicleMoveStatus: { sqlProp: "CODE", keyParam: "VEH_MV_STS" },
  });

  return { ...base, codeMap };
}

export type CtrlDataDtgModel = ReturnType<typeof useCtrlDataDtgModel>;
