import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useVehicleDailyBaseRtnMgmtModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { stores } = useCommonStores({
    vehTp: { sqlProp: "selectVehTpList" },
  });

  return { ...base, stores };
}

export type VehicleDailyBaseRtnMgmtModel = ReturnType<
  typeof useVehicleDailyBaseRtnMgmtModel
>;
