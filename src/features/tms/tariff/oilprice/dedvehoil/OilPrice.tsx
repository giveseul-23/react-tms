"use client";

import { useRef } from "react";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import DataGrid from "@/app/components/grid/DataGrid";

import { useOilPriceModel } from "./OilPriceModel";
import { useOilPriceController } from "./OilPriceController";
import {
  MASTER_COLUMN_DEFS,
  DF_OIL_COLUMN_DEFS,
  MONTH_COLUMN_DEFS,
} from "./OilPriceColumns";

export const MENU_CODE = "MENU_OIL_PRICE_DF";

export const AUTH = {
  grids: {
    master: "MAIN_GRID_OIL_PRICE",
    dfOil: "SUB01_GRID_OIL_PRICE",
    month: "MAIN_GRID2_OIL_PRICE",
  },
};

export default function OilPrice() {
  const model = useOilPriceModel(MENU_CODE);
  const activeTabRef = useRef<string>("REGISTER");
  const ctrl = useOilPriceController({ model, activeTabRef });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        excludes: ["LGST_GRP_CD", "SEARCH_FRM_DTTM"],
        ...model.bindSearch(),
      }}
      grid={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "REGISTER", label: "LBL_REGI_OILPRICE" },
            { key: "MONTH", label: "LBL_MONTH_OILPRICE" },
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
                  defaultSizes={[30, 70]}
                  minSizes={[15, 40]}
                  handleThickness="1.5"
                  storageKey={model.storageKeys.bottom}
                >
                  <DataGrid
                    {...model.bind("master")}
                    columnDefs={MASTER_COLUMN_DEFS}
                    authId={AUTH.grids.master}
                    actions={ctrl.masterActions}
                    onRowClicked={ctrl.onMasterRowClicked}
                    audit={false}
                  />
                  <DataGrid
                    {...model.bind("dfOil")}
                    columnDefs={DF_OIL_COLUMN_DEFS(model.grids.dfOil.setData)}
                    authId={AUTH.grids.dfOil}
                    actions={ctrl.dfOilActions}
                  />
                </SplitPane>
              ),
            },
            MONTH: {
              render: () => (
                <DataGrid
                  {...model.bind("month")}
                  columnDefs={MONTH_COLUMN_DEFS}
                  authId={AUTH.grids.month}
                  actions={ctrl.monthActions}
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
