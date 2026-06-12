"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useRateBatchModel } from "./RateBatchModel";
import { useRateBatchController } from "./RateBatchController";
import { MAIN_COLUMN_DEFS, CONDITION_COLUMN_DEFS } from "./RateBatchColumns";

export const MENU_CODE = "MENU_DISPATCH_RATE_BATCH";

export const AUTH = {
  grids: {
    main: "MAIN_GRID_DSPCH_RATE_BATCH",
    conditionInfo: "SUB01_GRID_DSPCH_RATE_BATCH",
  },
};

export default function RateBatch() {
  const model = useRateBatchModel(MENU_CODE);
  const ctrl = useRateBatchController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[70, 30]}
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
        <DataGrid
          {...model.bind("conditionInfo")}
          authId={AUTH.grids.conditionInfo}
          columnDefs={CONDITION_COLUMN_DEFS}
          codeMap={model.codeMap}
          headerCheckbox={false}
          actions={ctrl.conditionActions}
          pagination={false}
        />
      }
    />
  );
}
