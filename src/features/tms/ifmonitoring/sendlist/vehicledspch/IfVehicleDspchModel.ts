import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useIfVehicleDspchModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    interfaceType: { sqlProp: "CODE", keyParam: "IF_TCD" },
    interfaceStatus: { sqlProp: "CODE", keyParam: "IF_PRCS_STS" },
    ifPrcsMsgCd: { sqlProp: "CODE", keyParam: "IF_PRCS_MSG_CD" },
    invSysList: { sqlProp: "CODE", keyParam: "HARIM_INV_SYS_ID" },
  });

  return { ...base, codeMap };
}

export type IfVehicleDspchModel = ReturnType<typeof useIfVehicleDspchModel>;
