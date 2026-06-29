"use client";

// 운송상세 (서버 vc.view.mdl.tms.kpi.transdtl.TransportationDetail)
// 단일 그리드 KPI 조회 화면(읽기전용 inquiry) + 하단 합계행. 저장 없음.

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useTransportationDetailModel } from "./TransportationDetailModel";
import { useTransportationDetailController } from "./TransportationDetailController";
import { MAIN_COLUMN_DEFS } from "./TransportationDetailColumns";

export const MENU_CODE = "MENU_TRANSPORTATION_DETAIL";

// 그리드 리소스 권한 authId (센차 grid.authId)
export const AUTH = { grids: { main: "MAIN_GRID_TRANS_DTL" } };

export default function TransportationDetail() {
  const model = useTransportationDetailModel(MENU_CODE);
  const ctrl = useTransportationDetailController({ model });

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
          audit={false}
        />
      }
    />
  );
}
