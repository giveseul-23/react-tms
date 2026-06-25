import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// 배차진행상태(DSPCH_OP_STS) 셀 색상 — 센차 setDispatchOperationStatusColor 대응.
// TODO: 서버 공통 컨트롤러 setDispatchOperationStatusColor 의 정확한 코드→색상 매핑 확인 필요.
export type GridKey = "main" | "sub01" | "sub02" | "sub03";

export function useTenderDispatchModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    dspchOpSts: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    stopTp: { sqlProp: "CODE", keyParam: "STOP_TP" },
    ordTp: { sqlProp: "CODE", keyParam: "ORD_TP" },
  });

  return { ...base, codeMap };
}

export type TenderDispatchModel = ReturnType<typeof useTenderDispatchModel>;
