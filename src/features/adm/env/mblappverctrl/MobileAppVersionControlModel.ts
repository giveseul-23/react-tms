import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useMobileAppVersionControlModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { pageSize: 500 });

  const { stores } = useCommonStores({
    pltfrmTp: { module: "TMS", sqlProp: "CODE", keyParam: "PLTFRM_TP" },
  });

  const codeMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    Object.entries(stores).forEach(([storeKey, items]) => {
      map[storeKey] = {};
      (items ?? []).forEach((item: any) => {
        map[storeKey][item.CODE] = item.NAME;
      });
    });
    return map;
  }, [stores]);

  return {
    ...base,
    stores,
    codeMap,
  };
}

export type MobileAppVersionControlModel = ReturnType<
  typeof useMobileAppVersionControlModel
>;
