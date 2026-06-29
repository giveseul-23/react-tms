import { useState } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";
import { MAIN_COLUMN_DEFS } from "./LoadingRateStatusColumns";

// main: 일자별 적재율 / sub01: 차량유형별 요약 / sub02: 차량단위 상세
export type GridKey = "main" | "sub01" | "sub02";

export function useLoadingRateStatusModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode, { defaultLayout: "vertical" });

  // 메인 동적 컬럼 (조회 시 차량유형 메타로 재생성)
  const [mainColumnDefs, setMainColumnDefs] = useState<any[]>(MAIN_COLUMN_DEFS);
  // 설명 패널 텍스트 (적재비율기준(kg): ...)
  const [descText, setDescText] = useState<string>("적재비율기준(kg)");

  // 공통코드 — 차량운영유형 (sub02 combo: VEH_OP_TP)
  const { codeMap } = useCommonStores({
    vehOpTypeList: { module: "TMS", sqlProp: "CODE", keyParam: "VEH_OP_TP" },
  });

  return {
    ...base,
    mainColumnDefs,
    setMainColumnDefs,
    descText,
    setDescText,
    codeMap,
  };
}

export type LoadingRateStatusModel = ReturnType<typeof useLoadingRateStatusModel>;
