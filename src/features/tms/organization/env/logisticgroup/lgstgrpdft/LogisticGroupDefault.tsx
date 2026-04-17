"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useLogisticGroupDefaultModel } from "./LogisticGroupDefaultModel.ts";
import { useLogisticGroupDefaultController } from "./LogisticGroupDefaultController.tsx";
import {
  CNFG_HEADER_COLUMN_DEFS,
  CNFG_DETAIL_COLUMN_DEFS,
  DETAIL_COLUMN_DEFS,
} from "./LogisticGroupDefaultColumns.tsx";

const MENU_CODE = "MENU_ORGANIZATION_ENV_LGST_GRP_DFT";

export default function TenderReceiveDispatch() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useLogisticGroupDefaultModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  const ctrl = useLogisticGroupDefaultController({
    model,
    searchRef,
    filtersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <MasterDetailPage
      defaultSizes={[40, 60]}
      searchProps={{
        meta,
        fetchFn: ctrl.fetchDispatchList,
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
      storageKey="lgst-default-dispatch"
      master={
        <SplitPane
          direction="horizontal"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey="country-sub"
        >
          <DataGrid
            layoutType="plain"
            columnDefs={CNFG_HEADER_COLUMN_DEFS}
            rowData={model.cnfgGrpData.rows}
            onRowClicked={ctrl.handleRowClicked}
          />
          <DataGrid
            layoutType="plain"
            columnDefs={CNFG_DETAIL_COLUMN_DEFS}
            rowData={model.subCnfgRowData.rows}
            onRowClicked={ctrl.handleSubRowClicked}
          />
        </SplitPane>
      }
      detail={
        <DataGrid
          layoutType="plain"
          columnDefs={DETAIL_COLUMN_DEFS}
          rowData={model.subDetailRowData.rows}
          totalCount={model.subDetailRowData.totalCount}
          currentPage={model.subDetailRowData.page}
          pageSize={model.pageSize}
          onPageSizeChange={model.setPageSize}
          onPageChange={(page) => {
            model.resetSubGrids();
            searchRef.current?.(page, false);
          }}
          actions={ctrl.detailActions}
        />
      }
    />
  );
}
