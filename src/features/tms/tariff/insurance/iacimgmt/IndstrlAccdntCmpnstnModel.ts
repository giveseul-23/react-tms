import { useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main" | "rate" | "chg";

export function useIndstrlAccdntCmpnstnModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap: rawCodeMap } = useCommonStores({
    apProcTp: { sqlProp: "CODE", keyParam: "AP_PROC_TP" },
    rdngRcd: { sqlProp: "CODE", keyParam: "RDNG_RCD" },
  });

  // apProcTp 는 10(용차/회당), 20(월대)만 사용 — 레거시 apProcTpList filters 대응
  const codeMap = useMemo(() => ({
    ...rawCodeMap,
    apProcTp: Object.fromEntries(
      Object.entries(rawCodeMap.apProcTp ?? {}).filter(
        ([code]) => code === "10" || code === "20",
      ),
    ),
  }), [rawCodeMap]);

  return { ...base, codeMap };
}

export type IndstrlAccdntCmpnstnModel = ReturnType<
  typeof useIndstrlAccdntCmpnstnModel
>;
