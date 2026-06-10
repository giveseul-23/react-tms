import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "sub01" | "sub02";

export function useOrganizationModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  const { codeMap } = useCommonStores({
    custList: { sqlProp: "selectCustomerCodeName" },
  });

  return {
    ...base,
    codeMap,
  };
}

export type OrganizationModel = ReturnType<typeof useOrganizationModel>;
