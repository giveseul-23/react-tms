import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey =
  | "main"
  | "costDetail"
  | "costFunction"
  | "waypoint"
  | "evidence";

export function useDispatchOperatorCostModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  const { stores } = useCommonStores({
    apType: { sqlProp: "CODE", keyParam: "TM_LEGARCY_AP_TP" },
    financialStatus: { sqlProp: "CODE", keyParam: "DSPCH_FI_STS" },
    serviceType: { sqlProp: "CODE", keyParam: "TRF_SVC_TP" },
    pickDropDiv: { sqlProp: "CODE", keyParam: "STOP_TP" },
    schedTcd: { sqlProp: "CODE", keyParam: "SCHED_TCD" },
    dsFiStsList: { sqlProp: "CODE", keyParam: "AP_FI_STS" },
    payTo: { sqlProp: "CODE", keyParam: "PAY_TO" },
    locTp: { sqlProp: "CODE", keyParam: "LOC_TP" },
    calTcd: { sqlProp: "CODE", keyParam: "CAL_TCD" },
    dlySetlSts: { sqlProp: "CODE", keyParam: "DLY_SETL_STS" },
    cnsigType: { sqlProp: "CODE", keyParam: "HARIM_CONSMT_TP" },
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

export type DispatchOperatorCostModel = ReturnType<
  typeof useDispatchOperatorCostModel
>;
