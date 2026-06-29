"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDispathApDetailModel } from "./DispathApDetailModel";
import { useDispathApDetailController } from "./DispathApDetailController";

export const MENU_CODE = "MENU_DSPCH_AP_DTL";
// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = { grids: { main: "MAIN_GRID_MENU_DSPCH_AP_DTL" } };

export default function DispathApDetail() {
  const model = useDispathApDetailModel(MENU_CODE);
  const ctrl = useDispathApDetailController({ model });

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
          authId={AUTH.grids.main}
          columnDefs={model.mainColumnDefs}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
    />
  );
}
