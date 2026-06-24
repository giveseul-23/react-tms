import { useState } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// 그리드 이름 union (서버 maingrid 4종 대응)
//  locationShpmVolume : 착지별 물량 (착지계획 탭1)
//  locationDspch      : 착지별 배차내역 (착지계획 탭2)
//  dedicatedTruck     : 자차배차계획 (center 그리드)
//  tempTruck          : 용차(스팟)배차내역 (east 그리드)
export type GridKey =
  | "locationShpmVolume"
  | "locationDspch"
  | "dedicatedTruck"
  | "tempTruck";

export function useDispatchPlanVehModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 lookup — 서버 Model stores 대응
  //  dspchOpSts : 배차진행상태 (DSPCH_OP_STS)  → 셀 컬러는 cellStyle 에서 처리
  //  vehTp      : 차량유형 (selectVehTpList; VEH_TP_CD → 명)
  const { codeMap } = useCommonStores({
    dspchOpSts: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    vehTp: { sqlProp: "selectVehTpList" },
  });

  // 차량위치 우측 슬라이드 패널 상태 (선택 차량행 + 열림 여부)
  const [vehLocRows, setVehLocRows] = useState<any[]>([]);
  const [vehLocPanelOpen, setVehLocPanelOpen] = useState(false);

  return {
    ...base,
    codeMap,
    vehLocRows,
    setVehLocRows,
    vehLocPanelOpen,
    setVehLocPanelOpen,
  };
}

export type DispatchPlanVehModel = ReturnType<typeof useDispatchPlanVehModel>;
