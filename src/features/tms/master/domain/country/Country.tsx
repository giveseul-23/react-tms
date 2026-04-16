// src/views/tender/TenderReceiveDispatch.tsx
"use client";

import { useRef, useEffect } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { SplitPane } from "@/app/components/layout/SplitPane";

import { useCountryModel } from "./CountryModel";
import { useCountryController } from "./CountryController";
import {
  MAIN_COLUMN_DEFS,
  STATE_COLUMN_DEFS,
  CITY_COLUMN_DEFS,
  ZIP_COLUMN_DEFS,
} from "./CountryColumns.tsx";

const MENU_CODE = "MENU_CNTR_MGMT";

export default function Country() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useCountryModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    excludeKeysRef.current.add("BOOKING");
  }, []);

  const ctrl = useCountryController({
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
      storageKey="tender-receive-dispatch"
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
        <SplitPane
          direction="horizontal"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey="lgstgrp-opr-config-mst-bottom"
        >
          {/* Bottom-left: 설정코드다국어설정 */}
          <DataGrid
            layoutType="tab"
            tabs={[
              { key: "STATE", label: "시도" },
              { key: "ZIP", label: "우편번호" },
            ]}
            presets={{
              STATE: { columnDefs: STATE_COLUMN_DEFS },
              ZIP: { columnDefs: ZIP_COLUMN_DEFS },
            }}
            rowData={{
              STATE: model.subStateRowData,
              ZIP: model.subZipRowData,
            }}
            actions={[]}
          />

          {/* Bottom-right: 설정상세코드다국어설정 */}
          <DataGrid
            layoutType="plain"
            columnDefs={CITY_COLUMN_DEFS}
            rowData={model.subCityRowData}
            actions={ctrl.cityActions}
            subTitle="시군구"
          />
        </SplitPane>
      }
      //   bottomSlot={trackPanelContent}
      //   bottomOpen={model.trackOpen}
      //   bottomHeight={280}
    />
  );
}
