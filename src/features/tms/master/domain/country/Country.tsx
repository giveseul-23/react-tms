"use client";

import { useRef, useEffect } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { SplitPane } from "@/app/components/layout/SplitPane";

import { useCountryModel } from "./CountryModel.ts";
import { useCountryController } from "./CountryController";
import {
  MAIN_COLUMN_DEFS,
  STATE_COLUMN_DEFS,
  CITY_COLUMN_DEFS,
  ZIP_COLUMN_DEFS,
} from "./CountryColumns.tsx";
const MENU_CD = "MENU_CNTR_MGMT";

export default function Country() {
  const { meta, loading } = useSearchMeta(MENU_CD);
  const model = useCountryModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    excludeKeysRef.current.add("BOOKING");
  }, []);

  const ctrl = useCountryController({
    menuCd: MENU_CD,
    model,
    searchRef,
    filtersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <MasterDetailPage
      searchProps={{
        meta,
        fetchFn: ctrl.fetchDispatchList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        pageSize: model.pageSize,
        excludeKeysRef,
      }}
      direction={model.layout === "vertical" ? "horizontal" : "vertical"}
      layoutToggle={{
        layout: model.layout,
        onToggle: () =>
          model.setLayout((prev: LayoutType) =>
            prev === "side" ? "vertical" : "side",
          ),
      }}
      storageKey="country"
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
            searchRef.current?.(page, false);
          }}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.handleRowClicked}
        />
      }
      detail={
        <SplitPane
          direction="horizontal"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey="country-sub"
        >
          <DataGrid
            layoutType="tab"
            tabs={[
              { key: "STATE", label: "시도" },
              { key: "ZIP", label: "우편번호" },
            ]}
            presets={{
              STATE: {
                columnDefs: [],
                render: () => (
                  <SplitPane
                    direction="horizontal"
                    defaultSizes={[50, 50]}
                    minSizes={[25, 25]}
                    handleThickness="1.5"
                    storageKey="tempoil-register-split"
                  >
                    <DataGrid
                      layoutType="plain"
                      columnDefs={STATE_COLUMN_DEFS}
                      rowData={model.subStateRowData}
                      actions={ctrl.cityActions}
                      onRowClicked={ctrl.handleSubRowClicked}
                    />
                    <DataGrid
                      layoutType="plain"
                      columnDefs={CITY_COLUMN_DEFS}
                      rowData={model.subCityRowData}
                      actions={ctrl.cityActions}
                      subTitle="시군구"
                    />
                  </SplitPane>
                ),
                actions: ctrl.cityActions,
              },
              ZIP: { columnDefs: ZIP_COLUMN_DEFS, actions: ctrl.zipActions },
            }}
            rowData={{
              ZIP: model.subZipRowData,
            }}
            actions={[]}
          />
        </SplitPane>
      }
    />
  );
}
