import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "detail";

export function useSmsGroupModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { stores } = useCommonStores({
    vltnNtfctnTcd: { sqlProp: "CODE", keyParam: "VLTN_NTFCTN_TCD" },
    ntfctnChnlTcd: { sqlProp: "CODE", keyParam: "NTFCTN_CHNL_TCD" },
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

export type SmsGroupModel = ReturnType<typeof useSmsGroupModel>;
