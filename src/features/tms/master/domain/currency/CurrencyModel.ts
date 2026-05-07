import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useCurrencyModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { stores } = useCommonStores({
    currRdngRcd: { sqlProp: "CODE", keyParam: "CURR_RDNG_RCD" },
  });

  const codeMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    Object.entries(stores).forEach(([storeKey, items]) => {
      map[storeKey] = {};
      (items ?? []).forEach((item: any) => {
        map[storeKey][item.CODE] = item.NAME;
      });
    });
    return map;
  }, [stores]);

  return { ...base, codeMap };
}

export type CurrencyModel = ReturnType<typeof useCurrencyModel>;
