import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// main: 물류운영그룹단위 / sub01: 일자별 / sub02: 인수증 상세
export type GridKey = "main" | "sub01" | "sub02";

export function usePodColectionReportModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 주문진행상태 / 인수증진행상태
  const { codeMap } = useCommonStores({
    shpmOpStsList: { sqlProp: "CODE", keyParam: "SHPM_OP_STS" },
    podOpStatus: { sqlProp: "CODE", keyParam: "POD_STATUS" },
  });

  return { ...base, codeMap };
}

export type PodColectionReportModel = ReturnType<typeof usePodColectionReportModel>;
