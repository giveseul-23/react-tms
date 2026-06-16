"use client";

// 집기관리2 (서버 vc.view.mdl.tms.execution.cntr2.DspchContainer2)
// 단일 그리드 — 배차 단위 입/출고 수량 조회·셀 편집·저장.

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useDspchContainer2Model } from "./DspchContainer2Model";
import { useDspchContainer2Controller } from "./DspchContainer2Controller";
import { MAIN_COLUMN_DEFS } from "./DspchContainer2Columns";

export const MENU_CODE = "MENU_CONTAINER_MGMT2";

// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = { grids: { main: "MAIN_GRID_CONTRINER_REPORT2" } };

export default function DspchContainer2() {
  const model = useDspchContainer2Model(MENU_CODE);
  const ctrl = useDspchContainer2Controller({ model });

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
          actions={ctrl.mainActions}
          rowSelection="multiple"
        />
      }
    />
  );
}
