"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useCtrlDataMblModel } from "./CtrlDataMblModel";
import { useCtrlDataMblController } from "./CtrlDataMblController";
import { MAIN_COLUMN_DEFS } from "./CtrlDataMblColumns";

export const MENU_CODE = "MENU_IF_RCV_CTRL_DATA_MBL";
export const AUTH = {
  grids: {
    main: "MAIN_GRID_IF_RCV_CTRL_DATA_MBL",
  },
};

export default function CtrlDataMbl() {
  const model = useCtrlDataMblModel(MENU_CODE);
  const ctrl = useCtrlDataMblController({ model });

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
          authId={AUTH.grids.main}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
    />
  );
}
