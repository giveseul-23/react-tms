"use client";

// 서버 대응: vc.view.mdl.tms.dashboard.common.ChartController (Sencha ExtJS)
//   → 이 클래스는 독립 "화면"이 아니라 ECharts 옵션 팩토리(공용 유틸)다.
//     실제 대시보드 화면들(CostStatusChart / DeliveryStatusChart / FreightStatusChart /
//     TotalOverallChart / TransferStatusChart)이 상속/사용한다.
//   제공 기능(모두 echarts.setOption 옵션 빌더):
//     - initComponent(divName,i,opt,type): echarts.init + setOption, resize 핸들러
//     - makeCardOption: KPI 카드(타이틀/값/단위) DOM 렌더 (그리드 아님)
//     - makeDonutGauageOption: 도넛 게이지(gauge, 0~100%)
//     - makeVerticalBasicBarOption / makeBasicBarOption: 세로/가로 막대
//     - makeTimeLineOption: time 축 라인(영역)
//     - makeLineMakerOption: 온도 라인(markPoint/markLine/markArea) — 채널 온도 추이
//     - makePieMakerOption: 파이
//   ※ ag-grid 그리드 없음. 데이터 소스 URL 없음(소비 화면의 store proxy 가 가짐).
//
// 결론: CRUD 그리드 화면이 아니므로 그리드를 만들지 않는다.
//   ECharts 차트 컨테이너 플레이스홀더만 렌더한다.
//   MENU_CODE / useBaseModel 배선은 라우팅·컴파일을 위해 유지.
//
// TODO(차트 구현):
//   - echarts(또는 프로젝트 표준 차트 lib) 도입 후, 위 옵션 팩토리를 포팅.
//   - 실제 데이터는 소비 대시보드 화면(예: deliveryStatusDash/)에서 가져옴 — 본 공용 유틸 단독으로는 데이터 없음.
//   - KPI 카드/게이지/막대/라인/파이 등 차트 타입별 컴포넌트로 분리 검토.

import { useChartModel } from "./ChartModel";
import { useChartController } from "./ChartController";

export const MENU_CODE = "MENU_CHART";

export default function Chart() {
  const model = useChartModel(MENU_CODE);
  useChartController({ model });

  // TODO: ECharts 차트 렌더 영역. 현재는 플레이스홀더 컨테이너.
  return (
    <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
      {/* TODO: 공용 차트 유틸(ChartController.js) — 게이지/막대/라인/파이/KPI 카드. 차트 lib 도입 후 구현 */}
      Chart (ECharts) placeholder
    </div>
  );
}
