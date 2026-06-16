"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import { useProcessModel } from "./ProcessModel";
import { useProcessController } from "./ProcessController";
import { MAIN_COLUMN_DEFS } from "./ProcessColumns";

export const MENU_CODE = "MENU_DSPTCH_PROCESS_MGMT";

export default function Process() {
  const model = useProcessModel(MENU_CODE);
  const ctrl = useProcessController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          actions={ctrl.mainActions}
          codeMap={model.codeMap}
          headerCheckbox={false}
        />
      }
    />
  );
}
