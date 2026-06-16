"use client";

// KPI 비용배부 (서버 vc.view.mdl.tms.kpi.costdistr.CostDistribution)
// 단일 조회조건 영역 + 탭 2개(주문단위 / 품목단위) 조회 전용 그리드. 읽기전용.

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useCostDistributionModel } from "./CostDistributionModel";
import { useCostDistributionController } from "./CostDistributionController";
import { MAIN_COLUMN_DEFS, SUB01_COLUMN_DEFS } from "./CostDistributionColumns";

export const MENU_CODE = "MENU_COST_DISTR";

// 그리드 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = {
  grids: {
    main: "MAIN_GRID_COST_DISTR",
    sub01: "SUB01_GRID_COST_DISTR",
  },
};

export default function CostDistribution() {
  const model = useCostDistributionModel(MENU_CODE);
  const ctrl = useCostDistributionController({ model });

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
          layoutType="tab"
          tabs={[
            { key: "MAIN", label: "LBL_ORDER_UOM" },
            { key: "SUB01", label: "LBL_ITEM_UOM" },
          ]}
          presets={{
            MAIN: {
              render: () => (
                <DataGrid
                  {...model.bind("main")}
                  authId={AUTH.grids.main}
                  columnDefs={MAIN_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  onRowClicked={ctrl.onMainGridClick}
                  actions={ctrl.mainActions}
                  audit={false}
                />
              ),
            },
            SUB01: {
              render: () => (
                <DataGrid
                  {...model.bind("sub01")}
                  authId={AUTH.grids.sub01}
                  columnDefs={SUB01_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.sub01Actions}
                  audit={false}
                />
              ),
            },
          }}
          actions={[]}
        />
      }
    />
  );
}
