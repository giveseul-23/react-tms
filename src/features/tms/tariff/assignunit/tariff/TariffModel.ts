import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// main: 요율 / sub01: 요율항목 / sub02: 차량유형
export type GridKey = "main" | "sub01" | "sub02";

export function useTariffModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 서비스유형구분(SRVC_TP)
  const { codeMap } = useCommonStores({
    serviceTypeList: { sqlProp: "CODE", keyParam: "TRF_SVC_TP" },
  });

  return { ...base, codeMap };
}

export type TariffModel = ReturnType<typeof useTariffModel>;
