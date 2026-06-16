"use client";

// 운임비용집계 (KPI) — 서버 vc.view.mdl.tms.kpi.frgcstagr.FreightCostAggregation
// 단일 그리드 읽기전용 리포트(요금코드 동적 컬럼 + 합계행).

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useFreightCostAggregationModel } from "./FreightCostAggregationModel";
import { useFreightCostAggregationController } from "./FreightCostAggregationController";

export const MENU_CODE = "MENU_FRG_CST_AGR";

export default function FreightCostAggregation() {
  const model = useFreightCostAggregationModel(MENU_CODE);
  const ctrl = useFreightCostAggregationController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          columnDefs={model.mainColumnDefs}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
    />
  );
}
