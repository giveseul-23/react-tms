import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// main: 공지 / sub01: 공지대상차량
export type GridKey = "main" | "sub01";

export function useNoticeModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 공지표시구분 / 차량운영유형 / Y·N
  const { codeMap } = useCommonStores({
    ntceDpTp: { module: "TMS", sqlProp: "CODE", keyParam: "NTCE_DP_TP" },
    vehicleOpType: { module: "TMS", sqlProp: "CODE", keyParam: "VEH_OP_TP" },
    fixYn: { module: "TMS", sqlProp: "CODE", keyParam: "YN" },
  });

  return { ...base, codeMap };
}

export type NoticeModel = ReturnType<typeof useNoticeModel>;
