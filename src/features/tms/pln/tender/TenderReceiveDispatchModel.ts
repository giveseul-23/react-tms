import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "stop" | "sms" | "apSetl";

export function useTenderReceiveDispatchModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    dspchOpSts: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    apFiSts: { sqlProp: "CODE", keyParam: "AP_FI_STS" },
    carrCfmVehTcd: { sqlProp: "CODE", keyParam: "CARR_CFM_VEH_TCD" },
  });

  return {
    ...base,
    codeMap,
  };
}

export type TenderReceiveDispatchModel = ReturnType<
  typeof useTenderReceiveDispatchModel
>;
