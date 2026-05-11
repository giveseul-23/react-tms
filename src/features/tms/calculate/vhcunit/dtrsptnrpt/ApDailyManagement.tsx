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
              render: () => (
                <DataGrid
                  {...model.bind("main")}
                  columnDefs={model.mainColumnDefs}
                  codeMap={model.codeMap}
                  actions={ctrl.mainActions}
                  onRowClicked={ctrl.onMainGridClick}
                  audit={false}
                />
              ),
            },
            DETAIL: {
              render: () => (
                <DataGrid
                  {...model.bind("detail")}
                  columnDefs={model.detailColumnDefs}
                  codeMap={model.codeMap}
                  actions={ctrl.detailActions}
                  audit={false}
                />
              ),
            },
          }}
          actions={[]}
        />
      }
    />
  );
}
