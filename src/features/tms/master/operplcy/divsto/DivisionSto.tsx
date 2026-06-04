"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDivisionStoModel } from "./DivisionStoModel";
import { useDivisionStoController } from "./DivisionStoController";
import { MAIN_COLUMN_DEFS, DETAIL_COLUMN_DEFS } from "./DivisionStoColumns";

export const MENU_CODE = "MENU_DIV_STO_MGMT";

export default function DivisionSto() {
  const model = useDivisionStoModel(MENU_CODE);
  const ctrl = useDivisionStoController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[50, 50]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      defaultDirection="vertical"
      layoutToggle={true}
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          onRowClicked={ctrl.onMainGridClick}
          audit={false}
          headerCheckbox={false}
        />
      }
      detail={
        <DataGrid
          {...model.bind("detail")}
          columnDefs={DETAIL_COLUMN_DEFS}
          actions={ctrl.detailActions}
          headerCheckbox={false}
        />
      }
    />
  );
}
