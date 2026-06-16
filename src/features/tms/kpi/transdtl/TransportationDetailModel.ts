import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// 단일 그리드(운송상세 조회 — 읽기전용 inquiry)
export type GridKey = "main";

export function useTransportationDetailModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 정산처리구분 (서버 stores.apProcTpList: module TMS / sqlProp CODE / keyParam AP_PROC_TP)
  const { codeMap } = useCommonStores({
    apProcTp: { sqlProp: "CODE", keyParam: "AP_PROC_TP" },
  });

  return { ...base, codeMap };
}

export type TransportationDetailModel = ReturnType<
  typeof useTransportationDetailModel
>;
