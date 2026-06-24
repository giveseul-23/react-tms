import { useBaseModel } from "@/app/feature/useBaseModel";

// main: 고객사 / sub01: 사업장 / sub02: 매출계약
export type GridKey = "main" | "sub01" | "sub02";

export function useContractModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  return base;
}

export type ContractModel = ReturnType<typeof useContractModel>;
