"use client";

// 컨테이너 배차 리포트 (서버 vc.view.mdl.tms.execution.cntrrpt.DspchContainerReport)
// 조회조건 + 탭 3종(일자별/점포별/차량별) 그리드. 조회 전용 리포트 — 편집/저장 없음.

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useDspchContainerReportModel } from "./DspchContainerReportModel";
import { useDspchContainerReportController } from "./DspchContainerReportController";

export const MENU_CODE = "MENU_CONTAINER_REPORT";

// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = {
  grids: {
    main: "MAIN_GRID_CONTRINER_REPORT",
    sub01: "SUB01_GRID_CONTRINER_REPORT",
    sub02: "SUB02_GRID_CONTRINER_REPORT",
  },
};

export default function DspchContainerReport() {
  const model = useDspchContainerReportModel(MENU_CODE);
  const ctrl = useDspchContainerReportController({ model });

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
          layoutType="tab"
          tabs={[
            { key: "DAY", label: "LBL_BY_DAY" },
            { key: "LOC", label: "LBL_BY_LOC" },
            { key: "VEH", label: "LBL_BY_VEH" },
          ]}
          activeTab={ctrl.activeTab}
          onTabChange={ctrl.onTabChange}
          presets={{
            DAY: {
              render: () => (
                <DataGrid
                  {...model.bind("main")}
                  authId={AUTH.grids.main}
                  columnDefs={ctrl.mainColumnDefs}
                  codeMap={model.codeMap}
                  actions={ctrl.mainActions}
                  rowSelection="multiple"
                  audit={false}
                />
              ),
            },
            LOC: {
              render: () => (
                <DataGrid
                  {...model.bind("sub01")}
                  authId={AUTH.grids.sub01}
                  columnDefs={ctrl.sub01ColumnDefs}
                  codeMap={model.codeMap}
                  actions={ctrl.sub01Actions}
                  rowSelection="multiple"
                  audit={false}
                />
              ),
            },
            VEH: {
              render: () => (
                <DataGrid
                  {...model.bind("sub02")}
                  authId={AUTH.grids.sub02}
                  columnDefs={ctrl.sub02ColumnDefs}
                  codeMap={model.codeMap}
                  actions={ctrl.sub02Actions}
                  rowSelection="multiple"
                  audit={false}
                />
              ),
            },
          }}
          actions={[]}
        />
      }
    />
  );
}
