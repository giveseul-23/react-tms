"use client";

import { useRef } from "react";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import DataGrid from "@/app/components/grid/DataGrid";

import { useTempOilPriceModel } from "./TempOilPriceModel";
import { useTempOilPriceController } from "./TempOilPriceController";
import {
  MASTER_COLUMN_DEFS,
  OIL_PRICE_COLUMN_DEFS,
  PERIOD_COLUMN_DEFS,
} from "./TempOilPriceColumns";

export const MENU_CODE = "MENU_TEMP_VEH_OIL_PRICE_MGMT";

export default function TempOilPrice() {
  const model = useTempOilPriceModel(MENU_CODE);
  const activeTabRef = useRef<string>("REGISTER");
  const ctrl = useTempOilPriceController({ model, activeTabRef });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
        menuCode: MENU_CODE,
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
            model.searchRef.current?.();
          }}
          presets={{
            REGISTER: {
              render: () => (
                <SplitPane
                  direction="horizontal"
                  defaultSizes={[25, 75]}
                  minSizes={[15, 40]}
                  handleThickness="1.5"
                  storageKey={model.storageKeys.bottom}
                >
                  <DataGrid
                    layoutType="plain"
                    columnDefs={MASTER_COLUMN_DEFS}
                    rowData={model.grids.master.rows}
                    actions={ctrl.masterActions}
                    onRowClicked={ctrl.onMasterRowClicked}
                  />
                  <DataGrid
                    layoutType="plain"
                    columnDefs={OIL_PRICE_COLUMN_DEFS(
                      model.grids.oilPrice.setData,
                    )}
                    rowData={model.grids.oilPrice.rows}
                    actions={ctrl.oilPriceActions}
                  />
                </SplitPane>
              ),
            },
            PERIOD: {
              render: () => (
                <DataGrid
                  {...model.bind("period")}
                  columnDefs={PERIOD_COLUMN_DEFS}
                  actions={ctrl.periodActions}
                  audit={{ delete: false, rowStatus: false }}
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
