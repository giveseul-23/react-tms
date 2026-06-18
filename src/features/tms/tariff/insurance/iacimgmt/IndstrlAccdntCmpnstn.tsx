"use client";

import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useIndstrlAccdntCmpnstnModel } from "./IndstrlAccdntCmpnstnModel";
import { useIndstrlAccdntCmpnstnController } from "./IndstrlAccdntCmpnstnController";
import {
  MAIN_COLUMN_DEFS,
  DETAIL01_COLUMN_DEFS,
  DETAIL02_COLUMN_DEFS,
} from "./IndstrlAccdntCmpnstnColumns";

export const MENU_CODE = "MENU_IACI_MGMT";

export const AUTH = {
  grids: {
    main: "MAIN_GRID_IACI",
    rate: "SUB01_GRID_IACI",
    chg: "SUB02_GRID_IACI",
  },
};

export default function IndstrlAccdntCmpnstn() {
  const model = useIndstrlAccdntCmpnstnModel(MENU_CODE);
  const ctrl = useIndstrlAccdntCmpnstnController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[30, 70]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        excludes: ["IACI.USE_YN"],
        ...model.bindSearch(),
      }}
      defaultDirection="horizontal"
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          authId={AUTH.grids.main}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          rowSelection="multiple"
          audit={false}
        />
      }
      detail={
        <SplitPane
          direction="vertical"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey={model.storageKeys.bottom}
        >
          <DataGrid
            {...model.bind("rate")}
            columnDefs={DETAIL01_COLUMN_DEFS}
            authId={AUTH.grids.rate}
            codeMap={model.codeMap}
            model={model}
            actions={ctrl.rateActions}
            onRowClicked={ctrl.onRateRowClicked}
            audit={{ rowStatus: false }}
          />
          <DataGrid
            {...model.bind("chg")}
            columnDefs={DETAIL02_COLUMN_DEFS}
            authId={AUTH.grids.chg}
            codeMap={model.codeMap}
            actions={ctrl.chgActions}
            audit={{ updatePerson: false, updateTime: false }}
          />
        </SplitPane>
      }
    />
  );
}
