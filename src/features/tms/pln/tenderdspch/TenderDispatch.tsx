"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import DataGrid from "@/app/components/grid/DataGrid";

import { useTenderDispatchModel } from "./TenderDispatchModel";
import { useTenderDispatchController } from "./TenderDispatchController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
  SUB03_COLUMN_DEFS,
} from "./TenderDispatchColumns";

export const MENU_CODE = "MENU_PLAN_TENDER";

export const AUTH = {
  grids: {
    main: "MAIN_GRID_PLAN_TENDER",
    sub01: "SUB01_GRID_PLAN_TENDER",
    sub02: "SUB02_GRID_PLAN_TENDER",
    sub03: "SUB03_GRID_PLAN_TENDER",
  },
};

export default function TenderDispatch() {
  const model = useTenderDispatchModel(MENU_CODE);
  const ctrl = useTenderDispatchController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[50, 50]}
      defaultDirection="vertical"
      storageKey={model.storageKeys.outer}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchDispatchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      master={
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.onMainGridClick}
          rowSelection="multiple"
          audit={{
            insertPerson: true,
            insertDate: true,
            updatePerson: true,
            updateTime: true,
          }}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "STOP", label: "LBL_STOP" },
            { key: "ASSIGNED", label: "LBL_ASSIGNED_SHIPMENTS" },
          ]}
          presets={{
            STOP: {
              render: () => (
                <DataGrid
                  {...model.bind("sub01")}
                  authId={AUTH.grids.sub01}
                  columnDefs={SUB01_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  headerCheckbox={false}
                  audit={false}
                />
              ),
            },
            ASSIGNED: {
              render: () => (
                <SplitPane direction="horizontal" defaultSizes={[60, 40]}>
                  <DataGrid
                    {...model.bind("sub02")}
                    authId={AUTH.grids.sub02}
                    columnDefs={SUB02_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    onRowClicked={ctrl.onSub02GridClick}
                    rowSelection="multiple"
                    audit={false}
                  />
                  <DataGrid
                    {...model.bind("sub03")}
                    authId={AUTH.grids.sub03}
                    columnDefs={SUB03_COLUMN_DEFS}
                    headerCheckbox={false}
                    audit={false}
                  />
                </SplitPane>
              ),
            },
          }}
          actions={[]}
        />
      }
    />
  );
}
