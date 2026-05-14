"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { SplitPane } from "@/app/components/layout/SplitPane";

import { useCountryModel } from "./CountryModel";
import { useCountryController } from "./CountryController";
import {
  MAIN_COLUMN_DEFS,
  STATE_COLUMN_DEFS,
  CITY_COLUMN_DEFS,
  ZIP_COLUMN_DEFS,
} from "./CountryColumns";

export const MENU_CD = "MENU_CNTR_MGMT";

export default function Country() {
  const model = useCountryModel(MENU_CD);
  const ctrl = useCountryController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CD}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
      }}
      defaultDirection="vertical"
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.onMainGridClick}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "STATE", label: "LBL_STATE" },
            { key: "ZIP", label: "LBL_ZIP_CODE" },
          ]}
          presets={{
            STATE: {
              render: () => (
                <SplitPane
                  direction="horizontal"
                  defaultSizes={[50, 50]}
                  minSizes={[25, 25]}
                  handleThickness="1.5"
                  storageKey={model.storageKeys.bottom}
                >
                  <DataGrid
                    {...model.bind("state")}
                    columnDefs={STATE_COLUMN_DEFS}
                    actions={ctrl.stateActions}
                    onRowClicked={ctrl.onStateGridClick}
                  />
                  <DataGrid
                    {...model.bind("city")}
                    columnDefs={CITY_COLUMN_DEFS}
                    actions={ctrl.cityActions}
                    subTitle="LBL_CITY"
                  />
                </SplitPane>
              ),
            },
            ZIP: {
              render: () => (
                <DataGrid
                  {...model.bind("zip")}
                  columnDefs={ZIP_COLUMN_DEFS}
                  actions={ctrl.zipActions}
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
