// src/views/dispatchPlan/DispatchPlan.tsx
// ─────────────────────────────────────────────────────────────
// 배차관리 (MENU_DISPATCH_PLAN)
//
// 레이아웃:
//   [SearchFilters]
//   [배차 메인 그리드]  ← 상단
//   ──── PanelResize ────
//   [하단 3-tab 그리드: 경유처 / 할당주문 / 미할당주문]
// ─────────────────────────────────────────────────────────────
"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useDispatchPlanModel } from "./DispatchPlanModel";
import { useDispatchPlanController } from "./DispatchPlanController";
import {
  MAIN_COLUMN_DEFS,
  STOP_COLUMN_DEFS,
  ALLOC_ORDER_COLUMN_DEFS,
  UNALLOC_ORDER_COLUMN_DEFS,
  ALLOC_ORDER_SUB_COLUMN_DEFS,
  UNALLOC_ORDER_SUB_COLUMN_DEFS,
} from "./DispatchPlanColumns";

const MENU_CODE = "MENU_DISPATCH_PLAN";

export default function DispatchPlan() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useDispatchPlanModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const rawFiltersRef = useRef<Record<string, string>>({});

  const ctrl = useDispatchPlanController({ model, searchRef, filtersRef, rawFiltersRef });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <MasterDetailPage
      searchProps={{
        meta,
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchDispatchPlanList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        rawFiltersRef,
        pageSize: model.pageSize,
      }}
      direction={model.layout === "side" ? "horizontal" : "vertical"}
      defaultSizes={[55, 45]}
      layoutToggle={{
        layout: model.layout,
        onToggle: () =>
          model.setLayout((prev: LayoutType) =>
            prev === "side" ? "vertical" : "side",
          ),
      }}
      storageKey="dispatch-plan-master-detail"
      master={
        <DataGrid
          layoutType="plain"
          columnDefs={MAIN_COLUMN_DEFS(model.codeMap)}
          rowData={model.gridData.rows}
          totalCount={model.gridData.totalCount}
          currentPage={model.gridData.page}
          pageSize={model.pageSize}
          onPageSizeChange={model.setPageSize}
          onPageChange={(page) => {
            model.resetSubGrids();
            searchRef.current?.(page, false);
          }}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.handleRowClicked}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "STOP", label: "경유처" },
            { key: "ALLOC", label: "할당주문" },
            { key: "UNALLOC", label: "미할당주문" },
          ]}
          presets={{
            STOP: {
              columnDefs: STOP_COLUMN_DEFS,
              actions: ctrl.stopActions,
            },
            ALLOC: {
              columnDefs: ALLOC_ORDER_COLUMN_DEFS,
              actions: ctrl.allocOrderActions,
              onRowClicked: ctrl.handleAllocOrderRowClicked,
            },
            UNALLOC: {
              columnDefs: UNALLOC_ORDER_COLUMN_DEFS,
              actions: ctrl.unallocOrderActions,
              onRowClicked: ctrl.handleUnallocOrderRowClicked,
            },
          }}
          rowData={{
            STOP: model.stopRowData,
            ALLOC: model.allocOrderRowData,
            UNALLOC: model.unallocOrderRowData,
          }}
          actions={[]}
          renderRightGrid={(activeTabKey) => {
            if (activeTabKey === "ALLOC") {
              return (
                <DataGrid
                  layoutType="plain"
                  columnDefs={ALLOC_ORDER_SUB_COLUMN_DEFS}
                  rowData={model.allocSubRowData}
                  actions={ctrl.allocSubActions}
                />
              );
            }
            if (activeTabKey === "UNALLOC") {
              return (
                <DataGrid
                  layoutType="plain"
                  columnDefs={UNALLOC_ORDER_SUB_COLUMN_DEFS}
                  rowData={model.unallocSubRowData}
                  actions={ctrl.unallocSubActions}
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
