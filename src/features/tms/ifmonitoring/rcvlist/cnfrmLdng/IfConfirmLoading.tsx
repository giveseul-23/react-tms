"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useIfConfirmLoadingModel } from "./IfConfirmLoadingModel";
import { useIfConfirmLoadingController } from "./IfConfirmLoadingController";
import { MAIN_COLUMN_DEFS } from "./IfConfirmLoadingColumns";

export const MENU_CODE = "MENU_IF_RCV_LDNG_CNFRM";

export default function IfConfirmLoading() {
  const model = useIfConfirmLoadingModel(MENU_CODE);
  const ctrl = useIfConfirmLoadingController({ model });

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
          authId="MAIN_GRID_IF_RCV_LDNG_CNFRM"
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
