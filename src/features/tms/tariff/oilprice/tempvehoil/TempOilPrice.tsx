"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useTempOilPriceModel } from "./TempOilPriceModel";
import { useTempOilPriceController } from "./TempOilPriceController";
import {
  MASTER_COLUMN_DEFS,
  OIL_PRICE_COLUMN_DEFS,
  PERIOD_COLUMN_DEFS,
} from "./TempOilPriceColumns";

const MENU_CODE = "MENU_TEMP_VEH_OIL_PRICE_MGMT";

export default function TempOilPrice() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useTempOilPriceModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());
  const activeTabRef = useRef<string>("REGISTER");

  const ctrl = useTempOilPriceController({
    model,
    searchRef,
    filtersRef,
    activeTabRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <GridOnlyPage
      searchProps={{
        meta,
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        pageSize: model.pageSize,
        excludeKeysRef,
      }}
      grid={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "REGISTER", label: "유가등록" },
            { key: "PERIOD", label: "기간별조회" },
          ]}
          onTabChange={(k) => {
            activeTabRef.current = k;
            searchRef.current?.();
          }}
          presets={{
            REGISTER: {
              columnDefs: [],
              render: () => (
                <SplitPane
                  direction="horizontal"
                  defaultSizes={[25, 75]}
                  minSizes={[15, 40]}
                  handleThickness="1.5"
                  storageKey="tempoil-register-split"
                >
                  <DataGrid
                    layoutType="plain"
                    columnDefs={MASTER_COLUMN_DEFS}
                    rowData={model.masterRowData.rows}
                    actions={ctrl.masterActions}
                    onRowClicked={ctrl.handleMasterRowClicked}
                  />
                  <DataGrid
                    layoutType="plain"
                    columnDefs={OIL_PRICE_COLUMN_DEFS}
                    rowData={model.oilPriceRowData.rows}
                    actions={ctrl.oilPriceActions}
                  />
                </SplitPane>
              ),
            },
            PERIOD: {
              columnDefs: PERIOD_COLUMN_DEFS,
              actions: ctrl.periodActions,
            },
          }}
          rowData={{
            PERIOD: model.periodRowData.rows,
          }}
          totalCount={model.periodRowData.totalCount}
          currentPage={model.periodRowData.page}
          pageSize={model.pageSize}
          onPageSizeChange={model.setPageSize}
          onPageChange={(page) => searchRef.current?.(page)}
          actions={[]}
        />
      }
    />
  );
}
