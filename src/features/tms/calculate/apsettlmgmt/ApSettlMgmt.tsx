"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useApSettlMgmtModel } from "./ApSettlMgmtModel";
import { useApSettlMgmtController } from "./ApSettlMgmtController";
import {
  MAIN_COLUMN_DEFS,
  SUMMARY_COLUMN_DEFS,
  MONTHLY_FARE_COLUMN_DEFS,
  HIRE_DISPATCH_PAY_COLUMN_DEFS,
  FREIGHT_PAY_COLUMN_DEFS,
  INDIRECT_PAY_COLUMN_DEFS,
  COST_CENTER_COLUMN_DEFS,
  MATERIAL_COST_COLUMN_DEFS,
  EVIDENCE_COLUMN_DEFS,
} from "./ApSettlMgmtColumns";
export const MENU_CODE = "MENU_AP_SETTL_MGMT";

export default function ApSettlMgmt() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useApSettlMgmtModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  const ctrl = useApSettlMgmtController({
    model,
    searchRef,
    filtersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <MasterDetailPage
      defaultSizes={[45, 55]}
      searchProps={{
        meta,
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        pageSize: model.pageSize,
        excludeKeysRef,
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
      storageKey="ap-settl-mgmt"
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
            { key: "SUMMARY", label: "LBL_SUMMARY_LIST" },
            { key: "COST_CENTER", label: "LBL_EACH_COST_ACCOUNT" },
            { key: "MATERIAL", label: "MENU_FI_AP_SETL_ITM" },
            { key: "EVIDENCE", label: "LBL_SPRT_DOC" },
          ]}
          presets={{
            SUMMARY: {
              columnDefs: SUMMARY_COLUMN_DEFS,
              actions: ctrl.summaryActions,
            },
            COST_CENTER: {
              columnDefs: COST_CENTER_COLUMN_DEFS,
              actions: ctrl.costCenterActions,
            },
            MATERIAL: {
              columnDefs: MATERIAL_COST_COLUMN_DEFS,
              actions: ctrl.materialCostActions,
            },
            EVIDENCE: {
              columnDefs: EVIDENCE_COLUMN_DEFS,
              actions: ctrl.evidenceActions,
            },
          }}
          rowData={{
            SUMMARY: model.summaryRowData,
            COST_CENTER: model.costCenterRowData,
            MATERIAL: model.materialCostRowData,
            EVIDENCE: model.evidenceRowData,
          }}
          codeMap={model.codeMap}
          actions={[]}
          mainPanelSize={30}
          rightPanelSize={70}
          renderRightGrid={(activeTabKey) => {
            if (activeTabKey === "SUMMARY") {
              return (
                <DataGrid
                  layoutType="tab"
                  tabs={[
                    { key: "MONTHLY_FARE", label: "LBL_FIXED_VEH_CHARGE" },
                    { key: "HIRE_DISPATCH", label: "LBL_DSPCH_CHARGE" },
                    { key: "FREIGHT", label: "LBL_ITM_QTY_RATE" },
                    { key: "INDIRECT", label: "LBL_OVERHEAD_CHARGE" },
                  ]}
                  presets={{
                    MONTHLY_FARE: {
                      columnDefs: MONTHLY_FARE_COLUMN_DEFS,
                      actions: [],
                    },
                    HIRE_DISPATCH: {
                      columnDefs: HIRE_DISPATCH_PAY_COLUMN_DEFS,
                      actions: [],
                    },
                    FREIGHT: {
                      columnDefs: FREIGHT_PAY_COLUMN_DEFS,
                      actions: [],
                    },
                    INDIRECT: {
                      columnDefs: INDIRECT_PAY_COLUMN_DEFS,
                      actions: [],
                    },
                  }}
                  rowData={{
                    MONTHLY_FARE: model.monthlyFareRowData,
                    HIRE_DISPATCH: model.hireDispatchPayRowData,
                    FREIGHT: model.freightPayRowData,
                    INDIRECT: model.indirectPayRowData,
                  }}
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
