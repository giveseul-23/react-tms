"use client";

// 운임미발행배차목록 (서버 vc.view.mdl.tms.calculate.dspchunit.noapdsptchlist.NoApDispatchList)
// 단일 그리드(다중선택) + 동적 요율항목 컬럼. RATESHOP/지급협력사변경/동일회전배차합산 팝업.

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useNoApDispatchListModel } from "./NoApDispatchListModel";
import { useNoApDispatchListController } from "./NoApDispatchListController";

export const MENU_CODE = "MENU_NO_AP_DISPATCH_LIST";

// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = { grids: { main: "MAIN_GRID_NO_AP_DISPATCH_LIST" } };

export default function NoApDispatchList() {
  const model = useNoApDispatchListModel(MENU_CODE);
  const ctrl = useNoApDispatchListController({ model });

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
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          rowSelection="multiple"
          audit={false}
        />
      }
    />
  );
}
