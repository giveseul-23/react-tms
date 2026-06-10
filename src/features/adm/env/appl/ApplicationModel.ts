import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useApplicationModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { pageSize: 500 });

  const { codeMap } = useCommonStores({
    useYn: { sqlProp: "CODE", keyParam: "USE_YN" },
  });

  return {
    ...base,
    codeMap,
  };
}

export type ApplicationModel = ReturnType<typeof useApplicationModel>;
