import { useBaseController } from "@/app/feature/useBaseController";
import type { ChartModel, GridKey } from "./ChartModel";

interface Args {
  model: ChartModel;
}

// 서버 ChartController.js 는 echarts.setOption 옵션 팩토리(공용 유틸)일 뿐
// 조회/저장 같은 화면 핸들러가 없다. base 헬퍼만 배선해 둔다.
// TODO: 차트 lib 도입 후 옵션 빌더(게이지/막대/라인/파이/KPI 카드) 포팅.
export function useChartController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  return base;
}
