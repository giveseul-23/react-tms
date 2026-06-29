"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useIfCstDistModel } from "./IfCstDistModel";
import { useIfCstDistController } from "./IfCstDistController";
import { MAIN_COLUMN_DEFS, SUB01_COLUMN_DEFS } from "./IfCstDistColumns";

export const MENU_CODE = "MENU_IF_CST_DIST";

// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = {
  grids: { main: "MAIN_GRID_IF_CST_DIST", sub01: "SUB01_GRID_IF_CST_DIST" },
};

export default function IfCstDist() {
  const model = useIfCstDistModel(MENU_CODE);
  const ctrl = useIfCstDistController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultDirection="vertical"
      defaultSizes={[50, 50]}
      storageKey={model.storageKeys.outer}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      master={
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
      detail={
        <DataGrid
          {...model.bind("sub01")}
          authId={AUTH.grids.sub01}
          columnDefs={SUB01_COLUMN_DEFS}
          audit={false}
        />
      }
    />
  );
}
