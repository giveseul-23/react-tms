import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// main: 착지단위 배차 / sub01: 운송단위 입출고 수량
export type GridKey = "main" | "sub01";

export function useDspchContainerModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 배차진행상태 / 운송단위 / 착지구분
  const { codeMap } = useCommonStores({
    dspchOpSts: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    cntrCd: { sqlProp: "selectCntrCodeName" },
    stopTp: { sqlProp: "CODE", keyParam: "STOP_TP" },
  });

  return { ...base, codeMap };
}

export type DspchContainerModel = ReturnType<typeof useDspchContainerModel>;
