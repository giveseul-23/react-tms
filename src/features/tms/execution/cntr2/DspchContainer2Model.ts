import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// 단일 그리드 — 집기관리2 (배차 단위 입/출고 수량)
export type GridKey = "main";

export function useDspchContainer2Model(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 배차진행상태 / 착지구분 / 차량운영구분 (서버 ViewModel stores 대응)
  const { codeMap } = useCommonStores({
    dspchOpStsList: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    stopTpList: { sqlProp: "CODE", keyParam: "STOP_TP" },
    vehOpTpList: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
  });

  return { ...base, codeMap };
}

export type DspchContainer2Model = ReturnType<typeof useDspchContainer2Model>;
