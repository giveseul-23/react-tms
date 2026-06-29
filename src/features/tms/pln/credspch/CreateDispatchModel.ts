import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// 상단(운송주문) / 하단(품목정보) 그리드
export type GridKey = "main" | "sub01";

export function useCreateDispatchModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { stores, codeMap } = useCommonStores({
    shpmTpList: { sqlProp: "CODE", keyParam: "SHPM_TP" },
    shpmOpStsList: { sqlProp: "CODE", keyParam: "SHPM_OP_STS" },
    itmUomList: { sqlProp: "CODE", keyParam: "ITM_UOM" },
  });

  return { ...base, stores, codeMap };
}

export type CreateDispatchModel = ReturnType<typeof useCreateDispatchModel>;
