import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useCtrlDataMblModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    interfaceStatus: { sqlProp: "CODE", keyParam: "IF_PRCS_STS" },
  });

  return { ...base, codeMap };
}

export type CtrlDataMblModel = ReturnType<typeof useCtrlDataMblModel>;
