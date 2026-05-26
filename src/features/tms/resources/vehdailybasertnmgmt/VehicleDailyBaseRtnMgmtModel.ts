import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main";

export function useVehicleDailyBaseRtnMgmtModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
    return { ...base };
}

export type VehicleDailyBaseRtnMgmtModel = ReturnType<typeof useVehicleDailyBaseRtnMgmtModel>;