import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useOverheadItemModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    gnrlLdgrCd: { sqlProp: "CODE", keyParam: "GNRL_LDGR_CD" },
    cstCntrCdList: { sqlProp: "CODE", keyParam: "CST_CNTR_CD" },
  });

  return { ...base, codeMap };
}

export type OverheadItemModel = ReturnType<typeof useOverheadItemModel>;
