"use client";

// 서버 대응: vc.view.mdl.tms.dashboard.freightStatusDash.FreightStatusChart (Sencha ExtJS)
//   → "운송현황 대시보드" 차트 화면. ag-grid 그리드 없음(ECharts 기반).
//     상속: vc.view.mdl.tms.dashboard.common.ChartController (공용 ECharts 옵션 팩토리, → ../Chart.tsx)
//
//   렌더 구성(서버 FreightStatusChartModel.js 의 chartInfo store):
//     [상단 KPI 카드 6] makeCardOption
//       freight_chart_01_top  배송요청건수      DLVRY_TOTAL_ORDER_COUNT
//       freight_chart_02_top  잔여납품건수      RMN_DLVRY_CNT
//       freight_chart_03_top  납품완료율        DLVRY_DELIVERED_PERCENTAGE
//       freight_chart_04_top  이고/구매요청건수 STO_TOTAL_ORDER_COUNT
//       freight_chart_05_top  잔여이고/구매요청 RMN_STO_PRC_REQ
//       freight_chart_06_top  이고/구매완료율   STO_DELIVERED_PERCENTAGE
//     [중단 세로막대 2] makeVerticalBasicBarOption — Open/Planning/Loading/InTransit/Delivered 5단계
//       freight_chart_01_middle 배송진행현황 DLVRY_(OPEN|PLANNING|LOADING|INTRANSIT|DELIVERED)_COUNT
//       freight_chart_02_middle 이고진행현황 STO_(OPEN|PLANNING|LOADING|INTRANSIT|DELIVERED)_COUNT
//     [하단 KPI 카드] 배차/물량
//       좌: 배차건수(계획) DSPCH_TOTAL_COUNT / 배차건수(완료) DSPCH_DELIVERED_COUNT /
//           운송완료 DSPCH_DELIVERED_PERCENTAGE / Ton(Kg) TON,KG
//       우: 단위별 확정물량 BOX/SU/TO/G/PAC/EA/HD/KG/ROL/ETC → *_TOTAL_CFM_QTY
//
//   데이터 소스: POST /freightChartService/search
//     params { DIV_CD, LGST_GRP_CD, FRM_DLVRY_DT, TO_DLVRY_DT, MENU_CD }
//     응답 record.data.dsOut[<dataIndex>] (단일 KPI row 의 필드 묶음)
//
// 결론: CRUD 그리드 화면이 아니므로 그리드를 만들지 않는다(../Chart.tsx 와 동일한 최소 접근).
//   MENU_CODE / useBaseModel / useBaseController 배선은 라우팅·컴파일을 위해 유지.
//
// TODO(차트 구현):
//   - echarts(또는 프로젝트 표준 차트 lib) 도입 후 KPI 카드 6+/세로막대 2 포팅.
//   - 조회조건(DIV_CD/LGST_GRP_CD/FRM_DLVRY_DT/TO_DLVRY_DT) → freightStatusChartApi.search 호출 후
//     dsOut KPI 필드를 카드/막대 옵션에 매핑.

import { useFreightStatusChartModel } from "./FreightStatusChartModel";
import { useFreightStatusChartController } from "./FreightStatusChartController";

export const MENU_CODE = "MENU_FRT_STS";

export default function FreightStatusChart() {
  const model = useFreightStatusChartModel(MENU_CODE);
  useFreightStatusChartController({ model });

  // TODO: ECharts 차트 렌더 영역(상단 KPI 카드 6 / 중단 세로막대 2 / 하단 물량 카드).
  //       현재는 플레이스홀더 컨테이너.
  return (
    <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
      FreightStatusChart (ECharts) placeholder
    </div>
  );
}
