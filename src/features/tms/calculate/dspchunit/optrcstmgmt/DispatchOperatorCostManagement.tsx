"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
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

export default function DispatchOperatorCostManagement() {
  const model = useDispatchOperatorCostModel(MENU_CODE);
  const ctrl = useDispatchOperatorCostController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[55, 45]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      defaultDirection="horizontal"
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
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
                <SplitPane direction="horizontal" defaultSizes={[70, 30]}>
                  <DataGrid
                    {...model.bind("costDetail")}
                    columnDefs={COST_DETAIL_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    actions={ctrl.costDetailActions}
                    onRowClicked={ctrl.onCostDetailRowClicked}
                    audit={false}
                  />
                  <DataGrid
                    {...model.bind("costFunction")}
                    columnDefs={COST_FUNCTION_COLUMN_DEFS}
                    actions={[]}
                    audit={false}
                  />
                </SplitPane>
              ),
            },
            WAYPOINT: {
              render: () => (
                <DataGrid
                  {...model.bind("waypoint")}
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
                  columnDefs={EVIDENCE_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.evidenceActions}
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
