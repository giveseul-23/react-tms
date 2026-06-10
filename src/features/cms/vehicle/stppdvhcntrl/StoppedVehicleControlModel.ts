import { useState } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "sub01" | "sub02" | "sub03";

export function useStoppedVehicleControlModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { pageSize: 500 });
  const { codeMap } = useCommonStores({});

  return {
    ...base,
    codeMap,
  };
}

export type StoppedVehicleControlModel = ReturnType<
  typeof useStoppedVehicleControlModel
>;
