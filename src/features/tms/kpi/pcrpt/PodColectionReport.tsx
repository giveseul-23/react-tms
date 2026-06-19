"use client";

// 인수증회수현황 리포트 (서버 vc.view.mdl.tms.kpi.pcrpt.PodColectionReport)
// 읽기전용 KPI 조회 화면 — 그리드 3개.
//   좌측 50%: main(물류운영그룹단위, 상단) + sub01(일자별, 하단) 수직 분할
//   우측 50%: sub02(인수증 상세)
// cascade: main 클릭 → sub01 조회, sub01 클릭 → sub02 조회.

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { Pane } from "@/app/components/layout/Pane";
import DataGrid from "@/app/components/grid/DataGrid";

import { usePodColectionReportModel } from "./PodColectionReportModel";
import { usePodColectionReportController } from "./PodColectionReportController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
} from "./PodColectionReportColumns";

export const MENU_CODE = "MENU_POD_CLETN_REPORT";

// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = {
  grids: {
    main: "MAIN_GRID_POD_CLETN_REPORT",
    sub01: "SUB01_GRID_POD_CLETN_REPORT",
    sub02: "SUB02_GRID_POD_CLETN_REPORT",
  },
};

export default function PodColectionReport() {
  const model = usePodColectionReportModel(MENU_CODE);
  const ctrl = usePodColectionReportController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultDirection="horizontal"
      storageKey={model.storageKeys.outer}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        menuCode: MENU_CODE,
        ...model.bindSearch(),
      }}
      master={
        <SplitPane
          direction="vertical"
          defaultSizes={[50, 50]}
          storageKey={model.storageKeys.top}
        >
          <Pane>
            <DataGrid
              {...model.bind("main")}
              authId={AUTH.grids.main}
              columnDefs={MAIN_COLUMN_DEFS}
              onRowClicked={ctrl.onMainGridClick}
              actions={ctrl.mainActions}
              headerCheckbox={false}
              audit={false}
            />
          </Pane>
          <Pane>
            <DataGrid
              {...model.bind("sub01")}
              authId={AUTH.grids.sub01}
              columnDefs={SUB01_COLUMN_DEFS}
              onRowClicked={ctrl.onSub01GridClick}
              actions={ctrl.sub01Actions}
              headerCheckbox={false}
              audit={false}
            />
          </Pane>
        </SplitPane>
      }
      detail={
        <DataGrid
          {...model.bind("sub02")}
          authId={AUTH.grids.sub02}
          columnDefs={SUB02_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.sub02Actions}
          headerCheckbox={false}
          audit={false}
        />
      }
    />
  );
}
