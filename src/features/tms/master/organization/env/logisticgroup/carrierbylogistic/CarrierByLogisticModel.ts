import { useState, useMemo} from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";
import {
  LOGISTIC_COLUMN_DEFS,
} from "./CarrierByLogisticColumns";


export type GridKey = "main" | "sub01" | "sub02";

export function useCarrierByLogisticModel(menuCode: string) {
    const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });
    const [mainColumnDefs] = useState<any[]>(
      LOGISTIC_COLUMN_DEFS,
    );
  
  const { stores } = useCommonStores({
    emailOpCd: { sqlProp: "CODE", keyParam: "EMAIL_OP_CD" },
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
    mainColumnDefs
  };
}


export type CarrierByLogisticModel = ReturnType<
  typeof useCarrierByLogisticModel
>;
