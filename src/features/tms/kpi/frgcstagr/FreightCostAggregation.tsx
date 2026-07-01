"use client";

// 운임비용집계 (KPI) — 서버 vc.view.mdl.tms.kpi.frgcstagr.FreightCostAggregation
// 단일 그리드 읽기전용 리포트(요금코드 동적 컬럼 + 합계행).

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useFreightCostAggregationModel } from "./FreightCostAggregationModel";
import { useFreightCostAggregationController } from "./FreightCostAggregationController";

export const MENU_CODE = "MENU_FRG_CST_AGR";

// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = {
  grids: {
    main: "MAIN_GRID_FRG_CST_AGR",
  },
};

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
        excludes: ["AP_PROC_TP", "ZERO_INCLD", "DV.VEH_NO"],
        ...model.bindSearch(),
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
          columnDefs={model.mainColumnDefs}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
    />
  );
}
