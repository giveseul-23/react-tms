"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useIfDispatchResultModel } from "./IfDispatchResultModel";
import { useIfDispatchResultController } from "./IfDispatchResultController";
import { MAIN_COLUMN_DEFS } from "./IfDispatchResultColumns";

export const MENU_CODE = "MENU_IF_SEND_DSPCH_RSLT";

export const AUTH = {
  grids: {
    main: "MAIN_GRID_IF_SEND_DSPCH_RSLT",
  },
};

export default function IfDispatchResult() {
  const model = useIfDispatchResultModel(MENU_CODE);
  const ctrl = useIfDispatchResultController({ model });

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
