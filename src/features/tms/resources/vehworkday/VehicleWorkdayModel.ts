import { useState } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";
import { MAIN_COLUMN_DEFS } from "./VehicleWorkdayColumns";

export type GridKey = "main";

export function useVehicleWorkdayModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const [mainColumnDefs, setMainColumnDefs] = useState<any[]>(
    MAIN_COLUMN_DEFS,
  );

  const { codeMap } = useCommonStores({
    workTp: { sqlProp: "CODE", keyParam: "WORK_DAY_TP" },
  });

  return {
    ...base,
    codeMap,
    mainColumnDefs,
    setMainColumnDefs,
  };
}

export type VehicleWorkdayModel = ReturnType<typeof useVehicleWorkdayModel>;