"use client";

// 운송주문 모니터링 (서버 vc.view.mdl.tms.execution.ordermonitor.OrderMonitor)
// 메인(운송주문) 상단 + 하단 좌우 분할: 비용계산식(sub01) | 비용조건(sub02). 조회 전용.

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import DataGrid from "@/app/components/grid/DataGrid";

import { useOrderMonitorModel } from "./OrderMonitorModel";
import { useOrderMonitorController } from "./OrderMonitorController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
} from "./OrderMonitorColumns";

export const MENU_CODE = "MENU_ORDER_MONITOR_MGMT";

// 서버 리소스 권한 authId (센차 grid.authId)
export const AUTH = {
  grids: {
    main: "MAIN_GRID_ORDER_MONITOR_MGMT",
    sub01: "SUB01_GRID_ORDER_MONITOR_MGMT",
    sub02: "SUB02_GRID_ORDER_MONITOR_MGMT",
  },
};

export default function OrderMonitor() {
  const model = useOrderMonitorModel(MENU_CODE);
  const ctrl = useOrderMonitorController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[50, 50]}
      defaultDirection="vertical"
      storageKey={model.storageKeys.outer}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      master={
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
      detail={
        <SplitPane
          direction="horizontal"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          storageKey={model.storageKeys.bottom}
        >
          <DataGrid
            {...model.bind("sub01")}
            authId={AUTH.grids.sub01}
            columnDefs={SUB01_COLUMN_DEFS}
            codeMap={model.codeMap}
            onRowClicked={ctrl.onSub01GridClick}
            actions={[]}
            audit={false}
          />
          <DataGrid
            {...model.bind("sub02")}
            authId={AUTH.grids.sub02}
            columnDefs={SUB02_COLUMN_DEFS}
            codeMap={model.codeMap}
            actions={[]}
            audit={false}
            pagination={false}
          />
        </SplitPane>
      }
    />
  );
}
