import { useBaseModel } from "@/app/feature/useBaseModel";

// 서버 DeliveryStatusChart 는 그리드 없는 ECharts 대시보드라 GridKey 가 없다.
// 컴파일/배선 유지를 위한 최소 union. TODO: 차트 데이터 state 도입 시 교체.
export type GridKey = "main";

export function useDeliveryStatusChartModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // TODO: 차트 데이터(dsOut)/옵션 state. 데이터는 deliveryStatusChartApi.search 로 조회.
  return { ...base };
}

export type DeliveryStatusChartModel = ReturnType<typeof useDeliveryStatusChartModel>;
