import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useMobileAppVersionControlModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { pageSize: 500 });

  const { codeMap } = useCommonStores({
    pltfrmTp: { module: "TMS", sqlProp: "CODE", keyParam: "PLTFRM_TP" },
  });

  return {
    ...base,
    codeMap,
  };
}

export type MobileAppVersionControlModel = ReturnType<
  typeof useMobileAppVersionControlModel
>;
