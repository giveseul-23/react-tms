"use client";

// 미정산배차 (KPI) — 서버 vc.view.mdl.tms.kpi.unsettldspch.UnsettlementDispatch
// 단일 그리드 조회 전용(읽기전용). moduleDefault "TMS".

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useUnsettlementDispatchModel } from "./UnsettlementDispatchModel";
import { useUnsettlementDispatchController } from "./UnsettlementDispatchController";
import { MAIN_COLUMN_DEFS } from "./UnsettlementDispatchColumns";

export const MENU_CODE = "MENU_UNSETTL_DSPCH";
// 서버 리소스 권한 authId (센차 grid.authId)
export const AUTH = { grids: { main: "MAIN_GRID_UNSETTL_DSPCH" } };

export default function UnsettlementDispatch() {
  const model = useUnsettlementDispatchModel(MENU_CODE);
  const ctrl = useUnsettlementDispatchController({ model });

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
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          audit={false}
          actions={ctrl.mainActions}
        />
      }
    />
  );
}
