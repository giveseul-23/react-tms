"use client";

import { useRef } from "react";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useApDailyManagementModel } from "./ApDailyManagementModel";
import { useApDailyManagementController } from "./ApDailyManagementController";

export const MENU_CODE = "MENU_AP_DAILY_MGMT";

export default function ApDailyManagement() {
  const model = useApDailyManagementModel(MENU_CODE);
  // rawFiltersRef 는 SRCH_* prefix raw 조건 — 동적 컬럼 fetch 에 사용 (model 외 별도)
  const rawFiltersRef = useRef<Record<string, string>>({});
  const ctrl = useApDailyManagementController({ model, rawFiltersRef });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        rawFiltersRef,
        pageSize: model.pageSize,
        menuCode: MENU_CODE,
      }}
      grid={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "DAILY", label: "LBL_DAY_REPORT" },
            { key: "DETAIL", label: "LBL_DTL_DESC" },
          ]}
          presets={{
            DAILY: {
              columnDefs: model.mainColumnDefs,
              actions: ctrl.mainActions,
              onRowClicked: ctrl.onMainGridClick,
            },
            DETAIL: {
              columnDefs: model.detailColumnDefs,
              actions: ctrl.detailActions,
            },
          }}
          rowData={{
            DAILY: model.grids.main.rows,
            DETAIL: model.grids.detail.rows,
          }}
          codeMap={model.codeMap}
          totalCount={model.grids.main.data.totalCount}
          currentPage={model.grids.main.data.page}
          pageSize={model.pageSize}
          onPageSizeChange={model.setPageSize}
          onPageChange={(page) => model.searchRef.current?.(page)}
          actions={[]}
        />
      }
    />
  );
}
