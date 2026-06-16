"use client";

// 도크관리 (서버 vc.view.mdl.tms.master.account.dock.Dock)
// 메인(도크) + 하단(운영시간 슬롯) master→detail cascade.

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDockModel } from "./DockModel";
import { useDockController } from "./DockController";
import { MAIN_COLUMN_DEFS, SUB01_COLUMN_DEFS } from "./DockColumns";

export const MENU_CODE = "MENU_DOCK_MGMT";

// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = {
  grids: { main: "MAIN_GRID_DOCK_MGMT", sub01: "SUB01_GRID_DOCK_MGMT" },
};

export default function Dock() {
  const model = useDockModel(MENU_CODE);
  const ctrl = useDockController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[50, 50]}
      defaultDirection="vertical"
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
        />
      }
      detail={
        <DataGrid
          {...model.bind("sub01")}
          authId={AUTH.grids.sub01}
          columnDefs={SUB01_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.sub01Actions}
          rowSelection="multiple"
        />
      }
    />
  );
}
