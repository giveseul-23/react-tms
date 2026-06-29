import { useState } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { MAIN_COLUMN_DEFS } from "./FreightCostAggregationColumns";

// 단일 그리드 — 운임비용집계 리포트
export type GridKey = "main";

export function useFreightCostAggregationModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 동적 컬럼 (조회 시 요금코드 메타로 재생성)
  const [mainColumnDefs, setMainColumnDefs] = useState<any[]>(MAIN_COLUMN_DEFS);

  return { ...base, mainColumnDefs, setMainColumnDefs };
}

export type FreightCostAggregationModel = ReturnType<
  typeof useFreightCostAggregationModel
>;
