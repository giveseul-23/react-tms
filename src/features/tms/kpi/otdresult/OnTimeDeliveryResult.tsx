"use client";

// 납기준수실적 (서버 vc.view.mdl.tms.kpi.otdresult.OnTimeDeliveryResult)
// 단일 그리드 조회 전용. 저장/추가 없음, 팝업 없음.

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useOnTimeDeliveryResultModel } from "./OnTimeDeliveryResultModel";
import { useOnTimeDeliveryResultController } from "./OnTimeDeliveryResultController";
import { MAIN_COLUMN_DEFS } from "./OnTimeDeliveryResultColumns";

export const MENU_CODE = "MENU_OTD_MGMT";

// 그리드 리소스 권한 authId (센차 grid.authId 단일 소스)
export const AUTH = { grids: { main: "MAIN_GRID_OTD_MGMT" } };

export default function OnTimeDeliveryResult() {
  const model = useOnTimeDeliveryResultModel(MENU_CODE);
  const ctrl = useOnTimeDeliveryResultController({ model });

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
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
    />
  );
}
