"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SidePanel } from "@/app/components/layout/SidePanel";
import VehicleLocationPanel from "../dispatchPlanAd/panel/VehicleLocationPanel";
import DriveRoutePanel from "../dispatchPlanAd/panel/DriveRoutePanel";
import { InlineSearchCondition } from "@/app/components/Search/InlineSearchCondition";
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
  VEH_MGMT_COLUMN_DEFS,
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
    <>
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
            rowSelection="multiple"
            audit={{ delete: false }}
          />
        }
        detail={
          <DataGrid
            layoutType="tab"
            tabs={[
              { key: "STOP", label: "LBL_STOP" },
              { key: "ALLOC", label: "LBL_ASSIGNED_SHIPMENTS" },
              { key: "UNALLOC", label: "LBL_UNASSIGNED_SHIPMENTS" },
              { key: "VEHMGMT", label: "LBL_VEHICLE_MANAGER" },
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
                      actions={[]}
                      audit={{ delete: false }}
                    />
                  </SplitPane>
                ),
              },
              UNALLOC: {
                render: () => (
                  <div className="flex flex-col h-full min-h-0 gap-2">
                    {/* 미할당주문 탭 조회조건 (인라인 바형) — 라벨은 리터럴, LBL_* 키로 교체 가능.
                      payload 키/popup 픽커는 서버에 맞춰 사용자가 연결(TODO). */}
                    <InlineSearchCondition
                      onSearch={ctrl.handleUnallocOrderSearch}
                      searchBtnDisable={model.unallocSearching}
                      fields={[
                        {
                          type: "popup",
                          label: "품목코드",
                          code: model.unallocCond.ITEM_CD ?? "",
                          name: model.unallocCond.ITEM_NM_DISP ?? "",
                          onChangeCode: (v) =>
                            model.setUnallocCond((c) => ({ ...c, ITEM_CD: v })),
                          // TODO: 품목 조회 팝업 연결 (선택 시 ITEM_CD/ITEM_NM_DISP 세팅)
                          onClickSearch: () => {},
                        },
                        {
                          type: "text",
                          label: "품목명",
                          value: model.unallocCond.ITEM_NM ?? "",
                          onChange: (v) =>
                            model.setUnallocCond((c) => ({ ...c, ITEM_NM: v })),
                        },
                        {
                          type: "combo",
                          label: "배송유형",
                          value: model.unallocCond.DLVRY_TP ?? "",
                          onChange: (v) =>
                            model.setUnallocCond((c) => ({
                              ...c,
                              DLVRY_TP: v,
                            })),
                          options: model.stores.dlvryTpList ?? [],
                        },
                        {
                          type: "popup",
                          label: "도착지",
                          code: model.unallocCond.TO_LOC_CD ?? "",
                          name: model.unallocCond.TO_LOC_NM ?? "",
                          onChangeCode: (v) =>
                            model.setUnallocCond((c) => ({
                              ...c,
                              TO_LOC_CD: v,
                            })),
                          // TODO: 도착지 조회 팝업 연결 (선택 시 TO_LOC_CD/TO_LOC_NM 세팅)
                          onClickSearch: () => {},
                        },
                        {
                          type: "combo",
                          label: "온도조건",
                          value: model.unallocCond.TEMP_TCD ?? "",
                          onChange: (v) =>
                            model.setUnallocCond((c) => ({
                              ...c,
                              TEMP_TCD: v,
                            })),
                          options: model.stores.vehTempTcd ?? [],
                        },
                        {
                          type: "combo",
                          label: "P박스/비P박스",
                          value: model.unallocCond.PBOX_TP ?? "",
                          onChange: (v) =>
                            model.setUnallocCond((c) => ({ ...c, PBOX_TP: v })),
                          options: model.stores.pboxTpList ?? [],
                        },
                      ]}
                    />
                    <div className="flex-1 min-h-0">
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
                          audit={{ delete: false }}
                        />
                      </SplitPane>
                    </div>
                  </div>
                ),
              },
              VEHMGMT: {
                render: () => (
                  <DataGrid
                    {...model.bind("vehMgmt")}
                    columnDefs={VEH_MGMT_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    actions={ctrl.vehMgmtSubActions}
                    // onRowClicked={ctrl.onUnallocOrderRowClicked}
                    audit={false}
                  />
                ),
              },
            }}
            actions={[]}
          />
        }
      />

      <SidePanel
        open={model.vehLocPanelOpen}
        onClose={() => model.setVehLocPanelOpen(false)}
        title="BTN_SHOW_VEHICLE_LOCATION"
        width={520}
      >
        <VehicleLocationPanel row={model.grids.main.selected} />
      </SidePanel>

      <SidePanel
        open={model.routePanelOpen}
        onClose={() => model.setRoutePanelOpen(false)}
        title="BTN_SHOW_ROUTE"
        width={520}
      >
        <DriveRoutePanel row={model.grids.main.selected} />
      </SidePanel>
    </>
  );
}
