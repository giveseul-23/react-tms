import { useBaseModel } from "@/app/feature/useBaseModel";

// 서버 FreightStatusChart 는 그리드 없는 ECharts 대시보드라 GridKey 가 없다.
// 컴파일/배선 유지를 위한 최소 union. TODO: 차트 데이터 state 도입 시 교체.
export type GridKey = "main";

export function useFreightStatusChartModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // TODO: KPI 카드/세로막대 옵션 데이터 state. 차트 lib 도입 후 추가.
  return { ...base };
}

export type FreightStatusChartModel = ReturnType<typeof useFreightStatusChartModel>;
