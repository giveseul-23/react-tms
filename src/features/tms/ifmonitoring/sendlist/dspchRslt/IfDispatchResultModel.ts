import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useIfDispatchResultModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { stores } = useCommonStores({
    interfaceType: { sqlProp: "CODE", keyParam: "IF_TCD" },
    interfaceStatus: { sqlProp: "CODE", keyParam: "IF_PRCS_STS" },
    invSys: { sqlProp: "CODE", keyParam: "HARIM_INV_SYS_ID" },
    vehGrpCd: { sqlProp: "CODE", keyParam: "VEH_GRP_CD" },
    ordTp: { sqlProp: "CODE", keyParam: "ORD_TP" },
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

  return { ...base, codeMap };
}

export type IfDispatchResultModel = ReturnType<typeof useIfDispatchResultModel>;
