"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useControlDataReceptionStatusModel } from "./ControlDataReceptionStatusModel";
import { useControlDataReceptionStatusController } from "./ControlDataReceptionStatusController";
import { MAIN_COLUMN_DEFS } from "./ControlDataReceptionStatusColumns";

export const MENU_CODE = "MENU_CTRL_DATA_RCPTN_STS";

export default function ControlDataReceptionStatus() {
  const model = useControlDataReceptionStatusModel(MENU_CODE);
  const ctrl = useControlDataReceptionStatusController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
        menuCode: MENU_CODE,
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
    />
  );
}
