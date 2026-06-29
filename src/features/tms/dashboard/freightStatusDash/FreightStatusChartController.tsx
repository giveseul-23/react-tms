import { useBaseController } from "@/app/feature/useBaseController";
import type { FreightStatusChartModel, GridKey } from "./FreightStatusChartModel";

interface Args {
  model: FreightStatusChartModel;
}

// 서버 FreightStatusChartController.js 는 echarts 옵션 빌더(카드/세로막대)뿐 — CRUD 핸들러 없음.
// 조회 시 freightStatusChartApi.search(params) 결과(dsOut)를 카드/막대 옵션에 매핑한다(TODO: 차트 lib).
// 현재는 base 헬퍼만 배선.
export function useFreightStatusChartController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  return base;
}
