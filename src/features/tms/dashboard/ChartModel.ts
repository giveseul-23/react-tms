import { useBaseModel } from "@/app/feature/useBaseModel";

// 서버 ChartController.js 는 그리드/스토어가 없는 공용 ECharts 유틸이라 GridKey 가 없다.
// 컴파일/배선 유지를 위해 최소 union 만 둔다. TODO: 차트 데이터 모델 도입 시 교체.
export type GridKey = "main";

export function useChartModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // TODO: 차트 데이터/옵션 state. 본 공용 유틸은 데이터 소스가 없음(소비 화면이 보유).
  return { ...base };
}

export type ChartModel = ReturnType<typeof useChartModel>;
