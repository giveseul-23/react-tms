"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
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
        onSearch: ctrl.handleSearch,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
        menuCode: MENU_CODE,
      }}
      direction={model.layout === "side" ? "horizontal" : "vertical"}
      layoutToggle={{
        layout: model.layout,
        onToggle: () =>
          model.setLayout((prev: LayoutType) =>
            prev === "side" ? "vertical" : "side",
          ),
      }}
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
              columnDefs: COST_DETAIL_COLUMN_DEFS,
              actions: ctrl.costDetailActions,
              onRowClicked: ctrl.onCostDetailRowClicked,
            },
            WAYPOINT: {
              columnDefs: WAYPOINT_COLUMN_DEFS,
              actions: ctrl.waypointActions,
            },
            EVIDENCE: {
              columnDefs: EVIDENCE_COLUMN_DEFS,
              actions: ctrl.evidenceActions,
            },
          }}
          rowData={{
            COST: model.grids.costDetail.rows,
            WAYPOINT: model.grids.waypoint.rows,
            EVIDENCE: model.grids.evidence.rows,
          }}
          codeMap={model.codeMap}
          actions={[]}
          renderRightGrid={(activeTabKey) => {
            if (activeTabKey === "COST") {
              return (
                <DataGrid
                  layoutType="plain"
                  columnDefs={COST_FUNCTION_COLUMN_DEFS}
                  rowData={model.grids.costFunction.rows}
                  actions={[]}
                />
              );
            }
            return null;
          }}
        />
      }
    />
  );
}
