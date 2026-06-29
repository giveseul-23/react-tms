"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useIfLoadingStatusModel } from "./IfLoadingStatusModel";
import { useIfLoadingStatusController } from "./IfLoadingStatusController";
import { MAIN_COLUMN_DEFS } from "./IfLoadingStatusColumns";

export const MENU_CODE = "MENU_IF_RCV_LDNG_STAT";

export default function IfLoadingStatus() {
  const model = useIfLoadingStatusModel(MENU_CODE);
  const ctrl = useIfLoadingStatusController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          rowSelection="multiple"
          authId="MAIN_GRID_IF_RCV_LDNG_STAT"
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
    />
  );
}
