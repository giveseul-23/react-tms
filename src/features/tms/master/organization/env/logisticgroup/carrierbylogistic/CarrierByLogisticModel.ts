import { useState } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";
import { LOGISTIC_COLUMN_DEFS } from "./CarrierByLogisticColumns";

export type GridKey = "main" | "sub01" | "sub02";

export function useCarrierByLogisticModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });
  const [mainColumnDefs] = useState<any[]>(LOGISTIC_COLUMN_DEFS);

  const { codeMap } = useCommonStores({
    emailOpCd: { sqlProp: "CODE", keyParam: "EMAIL_OP_CD" },
  });

  return {
    ...base,
    codeMap,
    mainColumnDefs,
  };
}

export type CarrierByLogisticModel = ReturnType<
  typeof useCarrierByLogisticModel
>;
