import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useDispatchMonitoringModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    dspchTp: { sqlProp: "CODE", keyParam: "DSPCH_TP" },
    dspchOpSts: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    fiSts: { sqlProp: "CODE", keyParam: "FI_STS" },
  });

  return { ...base, codeMap };
}

export type DispatchMonitoringModel = ReturnType<typeof useDispatchMonitoringModel>;
