"use client";

// 컨테이너 배차 리포트 (서버 vc.view.mdl.tms.execution.cntrrpt.DspchContainerReport)
// 조회조건 + 탭 3종(일자별/점포별/차량별) 그리드. 조회 전용 리포트 — 편집/저장 없음.

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useDspchContainerReportModel } from "./DspchContainerReportModel";
import { useDspchContainerReportController } from "./DspchContainerReportController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
} from "./DspchContainerReportColumns";

export const MENU_CODE = "MENU_CONTAINER_REPORT";

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
          presets={{
            DAY: {
              render: () => (
                <DataGrid
                  {...model.bind("main")}
                  columnDefs={MAIN_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.mainActions}
                  audit={false}
                />
              ),
            },
            LOC: {
              render: () => (
                <DataGrid
                  {...model.bind("sub01")}
                  columnDefs={SUB01_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.sub01Actions}
                  audit={false}
                />
              ),
            },
            VEH: {
              render: () => (
                <DataGrid
                  {...model.bind("sub02")}
                  columnDefs={SUB02_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.sub02Actions}
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
