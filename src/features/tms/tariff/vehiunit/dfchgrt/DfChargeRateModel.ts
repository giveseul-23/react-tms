import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey =
  | "main"
  | "rtItem"
  | "rtCarr"
  | "rtVehTp"
  | "rtItemVehTp"
  | "rtItemVeh";

export function useDfChargeRateModel(menuCode: string) {
  return useBaseModel<GridKey>(menuCode);
}

export type DfChargeRateModel = ReturnType<typeof useDfChargeRateModel>;
