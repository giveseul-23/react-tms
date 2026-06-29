"use client";

// 적재율 현황 (서버 vc.view.mdl.tms.kpi.ldngrtsts.LoadingRateStatus)
// 메인(일자별 적재율, 동적 컬럼) + 하단 좌:차량유형별 요약 / 우:차량단위 상세.
// 상단 설명 패널: 적재비율기준(kg): 차량유형(기준) ...

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import DataGrid from "@/app/components/grid/DataGrid";

import { useLoadingRateStatusModel } from "./LoadingRateStatusModel";
import { useLoadingRateStatusController } from "./LoadingRateStatusController";
import { SUB01_COLUMN_DEFS, SUB02_COLUMN_DEFS } from "./LoadingRateStatusColumns";

export const MENU_CODE = "MENU_LOADING_RATE_STS";

// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = {
  grids: {
    main: "MAIN_GRID_LOADING_RATE_STS",
    sub01: "SUB01_GRID_LOADING_RATE_STS",
    sub02: "SUB02_GRID_LOADING_RATE_STS",
  },
};

export default function LoadingRateStatus() {
  const model = useLoadingRateStatusModel(MENU_CODE);
  const ctrl = useLoadingRateStatusController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultDirection="vertical"
      defaultSizes={[60, 40]}
      storageKey={model.storageKeys.outer}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        menuCode: MENU_CODE,
        ...model.bindSearch(),
      }}
      topSlot={
        <div className="px-2 py-1 text-left text-[12px] font-bold">
          {model.descText}
        </div>
      }
      master={
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
          columnDefs={model.mainColumnDefs}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          headerCheckbox={false}
          audit={false}
        />
      }
      detail={
        <SplitPane
          direction="horizontal"
          defaultSizes={[50, 50]}
          storageKey={model.storageKeys.bottom}
        >
          <DataGrid
            {...model.bind("sub01")}
            authId={AUTH.grids.sub01}
            columnDefs={SUB01_COLUMN_DEFS}
            codeMap={model.codeMap}
            onRowClicked={ctrl.onSub01GridClick}
            actions={ctrl.sub01Actions}
            headerCheckbox={false}
            audit={false}
          />
          <DataGrid
            {...model.bind("sub02")}
            authId={AUTH.grids.sub02}
            columnDefs={SUB02_COLUMN_DEFS}
            codeMap={model.codeMap}
            actions={ctrl.sub02Actions}
            headerCheckbox={false}
            audit={false}
          />
        </SplitPane>
      }
    />
  );
}
