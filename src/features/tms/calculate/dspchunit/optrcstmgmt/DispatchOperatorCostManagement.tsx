"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useDispatchOperatorCostModel } from "./DispatchOperatorCostManagementModel";
import { useDispatchOperatorCostController } from "./DispatchOperatorCostManagementController";
import {
  MAIN_COLUMN_DEFS,
  COST_DETAIL_COLUMN_DEFS,
  COST_FUNCTION_COLUMN_DEFS,
  WAYPOINT_COLUMN_DEFS,
  EVIDENCE_COLUMN_DEFS,
} from "./DispatchOperatorCostManagementColumns";

const MENU_CODE = "MENU_DSPCH_AP_CRATN_N_REVW";

export default function DispatchOperatorCostManagement() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useDispatchOperatorCostModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  const ctrl = useDispatchOperatorCostController({
    model,
    searchRef,
    filtersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <MasterDetailPage
      defaultSizes={[55, 45]}
      searchProps={{
        meta,
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        pageSize: model.pageSize,
        excludeKeysRef,
      }}
      direction={model.layout === "side" ? "horizontal" : "vertical"}
      layoutToggle={{
        layout: model.layout,
        onToggle: () =>
          model.setLayout((prev: LayoutType) =>
            prev === "side" ? "vertical" : "side",
          ),
      }}
      storageKey="dispatch-operator-cost-management"
      master={
        <DataGrid
          layoutType="plain"
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          rowData={model.gridData.rows}
          totalCount={model.gridData.totalCount}
          currentPage={model.gridData.page}
          pageSize={model.pageSize}
          onPageSizeChange={model.setPageSize}
          onPageChange={(page) => {
            model.resetSubGrids();
            searchRef.current?.(page);
          }}
          onRowClicked={ctrl.handleRowClicked}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "COST", label: "비용상세정보" },
            { key: "WAYPOINT", label: "경유처" },
            { key: "EVIDENCE", label: "증빙문서" },
          ]}
          presets={{
            COST: {
              columnDefs: COST_DETAIL_COLUMN_DEFS,
              actions: ctrl.costDetailActions,
              onRowClicked: ctrl.handleCostDetailRowClicked,
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
            COST: model.costDetailRowData,
            WAYPOINT: model.waypointRowData,
            EVIDENCE: model.evidenceRowData,
          }}
          codeMap={model.codeMap}
          actions={[]}
          renderRightGrid={(activeTabKey) => {
            if (activeTabKey === "COST") {
              return (
                <DataGrid
                  layoutType="plain"
                  columnDefs={COST_FUNCTION_COLUMN_DEFS}
                  rowData={model.costFunctionRowData}
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
