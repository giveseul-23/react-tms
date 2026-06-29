import { useBaseController } from "@/app/feature/useBaseController";
import type { DeliveryStatusChartModel, GridKey } from "./DeliveryStatusChartModel";

interface Args {
  model: DeliveryStatusChartModel;
}

// 서버 DeliveryStatusChartController.js 는 echarts 옵션 빌더 + 조회(onSearch → chartDraw)뿐.
// 그리드 CRUD 핸들러가 없으므로 base 헬퍼만 배선해 둔다.
// TODO: 차트 lib 도입 후 onSearch → deliveryStatusChartApi.search(params) → 응답 dsOut 으로
//   각 차트(card/gauage/pie/basicBar/verticalBasicBar) setOption 포팅.
export function useDeliveryStatusChartController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  return base;
}
