"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDispatchOperatorCostModel } from "./DispatchOperatorCostManagementModel";
import { useDispatchOperatorCostController } from "./DispatchOperatorCostManagementController";
import {
  MAIN_COLUMN_DEFS,
  COST_DETAIL_COLUMN_DEFS,
  COST_FUNCTION_COLUMN_DEFS,
  WAYPOINT_COLUMN_DEFS,
  EVIDENCE_COLUMN_DEFS,
} from "./DispatchOperatorCostManagementColumns";

export const MENU_CODE = "MENU_DSPCH_AP_CRATN_N_REVW";

export const AUTH = {
  grids: {
    main: "MAIN_GRID_DSPCH_AP_CRATN_N_REVW",
    costDetail: "SUB01_GRID_DSPCH_AP_CRATN_N_REVW",
    waypoint: "SUB02_GRID_DSPCH_AP_CRATN_N_REVW",
    costFunction: "SUB03_GRID_DSPCH_AP_CRATN_N_REVW",
    evidence: "SUB04_GRID_DSPCH_AP_CRATN_N_REVW",
  },
};

export default function DispatchOperatorCostManagement() {
  const model = useDispatchOperatorCostModel(MENU_CODE);
  const ctrl = useDispatchOperatorCostController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[68, 32]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
        excludes: ["LOC_DE_NM", "LOC_NM"],
      }}
      defaultDirection="vertical"
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          rowSelection="multiple"
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "COST", label: "LBL_RATE_INFO" },
            { key: "WAYPOINT", label: "LBL_STOP" },
            { key: "EVIDENCE", label: "LBL_SPRT_DOC" },
          ]}
          presets={{
            COST: {
              render: () => (
                <SplitPane direction="horizontal" defaultSizes={[60, 40]}>
                  <DataGrid
                    {...model.bind("costDetail")}
                    authId={AUTH.grids.costDetail}
                    columnDefs={COST_DETAIL_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    actions={ctrl.costDetailActions}
                    onRowClicked={ctrl.onCostDetailRowClicked}
                    onCellValueChanged={ctrl.onCostDetailChanged}
                  />
                  <div className="h-full min-h-0 pt-8">
                    <DataGrid
                      {...model.bind("costFunction")}
                      authId={AUTH.grids.costFunction}
                      columnDefs={COST_FUNCTION_COLUMN_DEFS}
                      onCellValueChanged={ctrl.onCostFunctionChanged}
                      actions={[]}
                      audit={false}
                    />
                  </div>
                </SplitPane>
              ),
            },
            WAYPOINT: {
              render: () => (
                <DataGrid
                  {...model.bind("waypoint")}
                  authId={AUTH.grids.waypoint}
                  columnDefs={WAYPOINT_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.waypointActions}
                  audit={false}
                />
              ),
            },
            EVIDENCE: {
              render: () => (
                <DataGrid
                  {...model.bind("evidence")}
                  authId={AUTH.grids.evidence}
                  columnDefs={EVIDENCE_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.evidenceActions}
                  rowSelection="multiple"
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
