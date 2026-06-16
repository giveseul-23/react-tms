import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// 단일 그리드 KPI 조회 화면
export type GridKey = "main";

export function useUnsettlementDispatchModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 정산처리구분 / 배차진행상태 (서버 stores: TMS 모듈)
  const { codeMap } = useCommonStores({
    apProcTpList: { module: "TMS", sqlProp: "CODE", keyParam: "AP_PROC_TP" },
    dspchOpStsList: { module: "TMS", sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
  });

  return { ...base, codeMap };
}

export type UnsettlementDispatchModel = ReturnType<typeof useUnsettlementDispatchModel>;
