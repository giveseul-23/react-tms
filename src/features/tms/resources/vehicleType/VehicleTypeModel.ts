import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useVehicleTypeModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    exVehTcd: { sqlProp: "CODE", keyParam: "EX_VEH_TCD", module: "ADM" },
    vehTpGrp: { sqlProp: "CODE", keyParam: "VEH_TP_GRP", module: "TMS" },
  });

  return { ...base, codeMap };
}

export type VehicleTypeModel = ReturnType<typeof useVehicleTypeModel>;
