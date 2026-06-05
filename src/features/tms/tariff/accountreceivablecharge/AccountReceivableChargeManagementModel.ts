import {useMemo} from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "sub01" | "sub02";

export function useAccountReceivableChargeModel(menuCode: string) {
    const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

    const { stores } = useCommonStores({
    supersedeTpList: { sqlProp: "CODE", keyParam: "SUPERSEDE_TP" },
    rdngRcdList: { sqlProp: "CODE", keyParam: "RDNG_RCD" },
    ynList: { sqlProp: "CODE", keyParam: "YN" },
    arTrfLevelList: { sqlProp: "CODE", keyParam: "AR_TRF_LCD" },
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


export type AccountReceivableChargeModel = ReturnType<
  typeof useAccountReceivableChargeModel
>;
