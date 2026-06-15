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
        onSearchCallback: ctrl.onSearchCallback,
        excludes: [
          { column: "LGST_GRP_CD", as: "LGST_GRP_CD" },
          { column: "DIV_CD", as: "DIV_CD" },
          {
            column: "TO_DTTM",
            as: { FROM: "TO_DTTM_ST", TO: "TO_DTTM_END" },
            transform: (v) => String(v).replace(/-/g, ""),
          },
        ],
        ...model.bindSearch(),
      }}
      grid={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "REGISTER", label: "LBL_REGI_OILPRICE" },
            { key: "PERIOD", label: "LBL_SEARCH_BY_PERIOD" },
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
                    {...model.bind("master")}
                    columnDefs={MASTER_COLUMN_DEFS}
                    actions={ctrl.masterActions}
                    onRowClicked={ctrl.onMasterRowClicked}
                    audit={false}
                  />
                  <DataGrid
                    {...model.bind("oilPrice")}
                    columnDefs={OIL_PRICE_COLUMN_DEFS}
                    actions={ctrl.oilPriceActions}
                    audit={{ updateTime: false }}
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
