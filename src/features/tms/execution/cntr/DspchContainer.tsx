"use client";

// 컨테이너관리 (서버 vc.view.mdl.tms.execution.cntr.DspchContainer)
// 메인(착지단위 배차) + 우측 sub01(운송단위 입/출고 수량).

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDspchContainerModel } from "./DspchContainerModel";
import { useDspchContainerController } from "./DspchContainerController";
import { MAIN_COLUMN_DEFS, SUB01_COLUMN_DEFS } from "./DspchContainerColumns";

export const MENU_CODE = "MENU_CONTAINER_MGMT";

// 서버 grid.authId — 그리드별 authId 단일 소스.
export const AUTH = {
  grids: { main: "MAIN_GRID_CONTAINER_MGMT", sub01: "SUB01_GRID_CONTAINER_MGMT" },
};

export default function DspchContainer() {
  const model = useDspchContainerModel(MENU_CODE);
  const ctrl = useDspchContainerController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[50, 50]}
      defaultDirection="horizontal"
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
        />
      }
    />
  );
}
