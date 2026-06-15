"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDispatchPlanModel } from "../dispatchPlanAd/DispatchPlanModel";
import { useDispatchPlanController } from "../dispatchPlanAd/DispatchPlanController";
import {
  MAIN_COLUMN_DEFS,
  STOP_COLUMN_DEFS,
  ALLOC_ORDER_COLUMN_DEFS,
  UNALLOC_ORDER_COLUMN_DEFS,
  ALLOC_ORDER_SUB_COLUMN_DEFS,
  UNALLOC_ORDER_SUB_COLUMN_DEFS,
} from "../dispatchPlanAd/DispatchPlanColumns";

export const MENU_CODE = "MENU_DISPATCH_PLAN";

// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = {
  grids: {
    main: "MAIN_GRID_DISPATCH_PLAN",
    stop: "SUB01_GRID_DISPATCH_PLAN",
    allocOrder: "SUB02_GRID_DISPATCH_PLAN",
    allocSub: "SUB05_GRID_DISPATCH_PLAN",
    unallocOrder: "SUB03_GRID_DISPATCH_PLAN",
    unallocSub: "SUB04_GRID_DISPATCH_PLAN",
  },
};

export default function DispatchPlan() {
  const model = useDispatchPlanModel(MENU_CODE);
  const ctrl = useDispatchPlanController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchDispatchPlanList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      defaultDirection="horizontal"
      defaultSizes={[65, 35]}
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.onMainGridClick}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "STOP", label: "LBL_STOP" },
            { key: "ALLOC", label: "LBL_ASSIGNED_SHIPMENTS" },
            { key: "UNALLOC", label: "LBL_UNASSIGNED_SHIPMENTS" },
          ]}
          presets={{
            STOP: {
              render: () => (
                <DataGrid
                  {...model.bind("stop")}
                  authId={AUTH.grids.stop}
                  columnDefs={STOP_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.stopActions}
                  audit={false}
                />
              ),
            },
            ALLOC: {
              render: () => (
                <SplitPane direction="vertical" defaultSizes={[70, 30]}>
                  <DataGrid
                    {...model.bind("allocOrder")}
                    authId={AUTH.grids.allocOrder}
                    columnDefs={ALLOC_ORDER_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    actions={ctrl.allocOrderActions}
                    onRowClicked={ctrl.onAllocOrderRowClicked}
                    audit={false}
                  />
                  <DataGrid
                    {...model.bind("allocSub")}
                    authId={AUTH.grids.allocSub}
                    columnDefs={ALLOC_ORDER_SUB_COLUMN_DEFS}
                    actions={ctrl.allocSubActions}
                  />
                </SplitPane>
              ),
            },
            UNALLOC: {
              render: () => (
                <SplitPane direction="vertical" defaultSizes={[70, 30]}>
                  <DataGrid
                    {...model.bind("unallocOrder")}
                    authId={AUTH.grids.unallocOrder}
                    columnDefs={UNALLOC_ORDER_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    actions={ctrl.unallocOrderActions}
                    onRowClicked={ctrl.onUnallocOrderRowClicked}
                    audit={false}
                  />
                  <DataGrid
                    {...model.bind("unallocSub")}
                    authId={AUTH.grids.unallocSub}
                    columnDefs={UNALLOC_ORDER_SUB_COLUMN_DEFS}
                    actions={ctrl.unallocSubActions}
                  />
                </SplitPane>
              ),
            },
          }}
          actions={[]}
        />
      }
    />
  );
}
