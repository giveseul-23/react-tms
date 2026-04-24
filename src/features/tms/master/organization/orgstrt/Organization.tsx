"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useOrganizationModel } from "./OrganizationModel";
import { useOrganizationController } from "./OrganizationController";
import {
  DIVISION_COLUMN_DEFS,
  LOGISTICS_GROUP_COLUMN_DEFS,
} from "./OrganizationColumns";
export const MENU_CD = "MENU_ORGANIZATION_STRUCT";

export default function Organization() {
  const { meta, loading } = useSearchMeta(MENU_CD);
  const model = useOrganizationModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  const ctrl = useOrganizationController({
    model,
    searchRef,
    filtersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <MasterDetailPage
      defaultSizes={[50, 50]}
      searchProps={{
        meta,
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        pageSize: model.pageSize,
        excludeKeysRef,
        menuCode: MENU_CD,
      }}
      direction={model.layout === "side" ? "horizontal" : "vertical"}
      layoutToggle={{
        layout: model.layout,
        onToggle: () =>
          model.setLayout((prev: LayoutType) =>
            prev === "side" ? "vertical" : "side",
          ),
      }}
      storageKey="organization-orgstrt"
      master={
        <DataGrid
          layoutType="plain"
          columnDefs={DIVISION_COLUMN_DEFS}
          codeMap={model.codeMap}
          rowData={model.divisionGridData.rows}
          totalCount={model.divisionGridData.totalCount}
          currentPage={model.divisionGridData.page}
          pageSize={model.pageSize}
          onPageSizeChange={model.setPageSize}
          onPageChange={(page) => {
            model.resetSubGrids();
            searchRef.current?.(page);
          }}
          onRowClicked={ctrl.handleRowClicked}
          actions={ctrl.divisionActions}
        />
      }
      detail={
        <DataGrid
          layoutType="plain"
          columnDefs={LOGISTICS_GROUP_COLUMN_DEFS}
          codeMap={model.codeMap}
          rowData={model.logisticsGroupRowData}
          actions={ctrl.logisticsGroupActions}
        />
      }
    />
  );
}
