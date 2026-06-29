import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// main: 하이패스매입정산문서 단위 / sub01: 차량단위 상세
export type GridKey = "main" | "sub01";

export function useHipassFareManagementModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 진행상태 / (도로)구분
  const { codeMap } = useCommonStores({
    fiStsList: { sqlProp: "CODE", keyParam: "HIPASS_FI_STS" },
    highWayTcd: { sqlProp: "CODE", keyParam: "HIGHWAY_OP_TCD" },
  });

  return { ...base, codeMap };
}

export type HipassFareManagementModel = ReturnType<typeof useHipassFareManagementModel>;
