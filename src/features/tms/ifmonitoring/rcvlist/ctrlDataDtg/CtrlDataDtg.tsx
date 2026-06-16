"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useCtrlDataDtgModel } from "./CtrlDataDtgModel";
import { useCtrlDataDtgController } from "./CtrlDataDtgController";
import { MAIN_COLUMN_DEFS } from "./CtrlDataDtgColumns";

export const MENU_CODE = "MENU_IF_RCV_CTRL_DATA_DTG";

export default function CtrlDataDtg() {
  const model = useCtrlDataDtgModel(MENU_CODE);
  const ctrl = useCtrlDataDtgController({ model });

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
          authId="MAIN_GRID_IF_RCV_CTRL_DATA_MBL"
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
