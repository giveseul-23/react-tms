"use client";

// 서버 대응: vc.view.mdl.tms.dashboard.deliveryStatusDash.DeliveryStatusChart (Sencha ExtJS)
//   - 배송현황 대시보드. ag-grid 그리드가 없는 ECharts 차트 화면이다.
//     (공용 옵션 팩토리 ChartController.js 를 상속 — 게이지/막대/파이/KPI 카드)
//   - 레이아웃: 서버는 deliveryStatusChartLayout.html 을 Ajax 로 받아 패널 body 에 주입한 뒤
//     div 별로 echarts.init/setOption 한다.
//
// 결론: CRUD 그리드 화면이 아니므로 그리드를 만들지 않는다(차트 컨테이너 플레이스홀더만 렌더).
//   MENU_CODE / useBaseModel / useBaseController 배선은 라우팅·컴파일을 위해 유지.
//   실제 데이터 소스: POST /chartService/search (DeliveryStatusChartApi.search) — 아래 패널들에 분배.
//
// 차트 패널 구성 (서버 DeliveryStatusChartModel.js chartInfo store):
//   [좌측] 5개 컬럼(배차/출하/품목/거리/확정중량) 각 3단:
//     · 상단 card    : 총계 KPI (DM_TOTAL_DSPCH_COUNT / DM_TOTAL_ORDER_COUNT /
//                       DM_TOTAL_MATERIAL_LINE_COUNT / DM_TOTAL_DSPCH_DISTANCE / DM_TOTAL_CONFIRMED_WEIGHT)
//     · 중단 verticalBasicBar : 지입차/용차 세로 막대 (DM_DF_*, DM_CF_*)
//     · 하단 pie     : 지입차/용차 비율 (DM_*_RATIO)
//   [우측] 2개 행(배차진행현황 / 수주진행현황) 각:
//     · gauage   : 전체/지입/용차 도넛 게이지 (DP_*_PROGRESS_RATIO / SP_*_COMPLETION_RATIO, 단위 %)
//     · basicBar : 계획/완료 가로 막대 6종 (DP_PLANNED_*, DP_COMPLETED_* / SP_*_ORDER_COUNT)
//   색상: total #d7d7d7, dedicated(지입) #c13530, contracted(용차) #2a3d54
//
// TODO(차트 구현):
//   - 차트 lib(recharts 또는 echarts 도입) 로 위 패널 포팅.
//   - 조회조건: DIV_CD(사업부) / LGST_GRP_CD(물류운영그룹) / FRM_DLVRY_DT~TO_DLVRY_DT(배송일 범위).
//   - 조회 시 deliveryStatusChartApi.search(params) → 응답 dsOut 의 dataIndex 별 값으로 각 차트 setOption.

import { useDeliveryStatusChartModel } from "./DeliveryStatusChartModel";
import { useDeliveryStatusChartController } from "./DeliveryStatusChartController";

export const MENU_CODE = "MENU_DLVRY_STS_DASH";

export default function DeliveryStatusChart() {
  const model = useDeliveryStatusChartModel(MENU_CODE);
  useDeliveryStatusChartController({ model });

  // TODO: ECharts/recharts 차트 렌더 영역. 현재는 플레이스홀더 컨테이너.
  return (
    <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
      {/* TODO: 배송현황 대시보드 차트(KPI 카드/세로막대/파이/게이지/가로막대). 차트 lib 도입 후 구현 */}
      Delivery Status Dashboard (chart) placeholder
    </div>
  );
}
