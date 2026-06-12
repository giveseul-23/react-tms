"use client";

import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useRateModel } from "./RateModel";
import { useRateController } from "./RateController";
import {
  MAIN_COLUMN_DEFS,
  DETAIL01_COLUMN_DEFS,
  DETAIL02_COLUMN_DEFS,
} from "./RateColumns";

export const MENU_CODE = "MENU_DSPTCH_RATE";

export const AUTH = {
  grids: {
    main: "MAIN_GRID_DSPTCH_RATE",
    costInfo: "SUB01_GRID_DSPTCH_RATE",
    conditionInfo: "SUB02_GRID_DSPTCH_RATE",
  },
};

export default function Rate() {
  const model = useRateModel(MENU_CODE);
  const ctrl = useRateController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[40, 60]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      defaultDirection="vertical"
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          headerCheckbox={false}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <SplitPane
          direction="horizontal"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey={model.storageKeys.bottom}
        >
          <DataGrid
            {...model.bind("costInfo")}
            authId={AUTH.grids.costInfo}
            columnDefs={DETAIL01_COLUMN_DEFS}
            codeMap={model.codeMap}
            headerCheckbox={false}
            actions={ctrl.costInfoActions}
            onRowClicked={ctrl.onCostInfoRowClicked}
            pagination={false}
          />
          <DataGrid
            {...model.bind("conditionInfo")}
            authId={AUTH.grids.conditionInfo}
            columnDefs={DETAIL02_COLUMN_DEFS}
            codeMap={model.codeMap}
            headerCheckbox={false}
            actions={ctrl.conditionInfoActions}
            pagination={false}
          />
        </SplitPane>
      }
    />
  );
}
