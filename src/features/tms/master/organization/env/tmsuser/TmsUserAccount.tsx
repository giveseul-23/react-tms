"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { Pane } from "@/app/components/layout/Pane";
import DataGrid from "@/app/components/grid/DataGrid";
import { useTmsUserAccountModel } from "./TmsUserAccountModel";
import { useTmsUserAccountController } from "./TmsUserAccountController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
  SUB03_COLUMN_DEFS,
} from "./TmsUserAccountColumns";

export const MENU_CODE = "MENU_TMS_USER_ACCOUNT";

export const AUTH = {
  grids: {
    main: "MAIN_GRID_TMS_USER_ACCOUNT",
    sub01: "SUB01_GRID_TMS_USER_ACCOUNT",
    sub02: "SUB02_GRID_TMS_USER_ACCOUNT",
    sub03: "SUB03_GRID_TMS_USER_ACCOUNT",
  },
};

export default function TmsUserAccount() {
  const model = useTmsUserAccountModel(MENU_CODE);
  const ctrl = useTmsUserAccountController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultDirection="vertical"
      defaultSizes={[50, 50]}
      storageKey={model.storageKeys.outer}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        excludes: ["LOC.LOC_CD"],
        ...model.bindSearch(),
      }}
      master={
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          onCellValueChanged={ctrl.onMainCellValueChanged}
          actions={ctrl.mainActions}
          headerCheckbox={false}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "BELONG", label: "LBL_BELONG_TO" },
            { key: "LOCATION", label: "LBL_USR_LOC" },
          ]}
          presets={{
            BELONG: {
              render: () => (
                <SplitPane
                  direction="horizontal"
                  defaultSizes={[50, 50]}
                  storageKey={model.storageKeys.bottom}
                >
                  <Pane>
                    <DataGrid
                      {...model.bind("sub01")}
                      authId={AUTH.grids.sub01}
                      columnDefs={SUB01_COLUMN_DEFS}
                      codeMap={model.codeMap}
                      onRowClicked={ctrl.onSub01GridClick}
                      actions={ctrl.sub01Actions}
                      pagination={false}
                      headerCheckbox={false}
                    />
                  </Pane>
                  <Pane>
                    <DataGrid
                      {...model.bind("sub02")}
                      authId={AUTH.grids.sub02}
                      columnDefs={SUB02_COLUMN_DEFS}
                      actions={ctrl.sub02Actions}
                      pagination={false}
                      headerCheckbox={false}
                    />
                  </Pane>
                </SplitPane>
              ),
            },
            LOCATION: {
              render: () => (
                <DataGrid
                  {...model.bind("sub03")}
                  authId={AUTH.grids.sub03}
                  columnDefs={SUB03_COLUMN_DEFS}
                  actions={ctrl.sub03Actions}
                  pagination={false}
                  headerCheckbox={false}
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
