import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main";

export function useCfChargeModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  return { ...base  };
}

export type CfChargeModel = ReturnType<typeof useCfChargeModel>;