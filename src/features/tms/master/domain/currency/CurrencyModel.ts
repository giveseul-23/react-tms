import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useCurrencyModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    currRdngRcd: { sqlProp: "CODE", keyParam: "CURR_RDNG_RCD" },
  });

  return { ...base, codeMap };
}

export type CurrencyModel = ReturnType<typeof useCurrencyModel>;
