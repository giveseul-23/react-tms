"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SidePanel } from "@/app/components/layout/SidePanel";
import VehicleLocationPanel from "./panel/VehicleLocationPanel";
import DriveRoutePanel from "./panel/DriveRoutePanel";
import { InlineSearchCondition } from "@/app/components/Search/InlineSearchCondition";
import type { GridSearchField } from "@/app/components/popup/PopupSearchCondition";
import { SplitPane } from "@/app/components/layout/SplitPane";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDispatchPlanModel } from "./DispatchPlanModel";
import { useDispatchPlanController } from "./DispatchPlanController";
import {
  MAIN_COLUMN_DEFS,
  STOP_COLUMN_DEFS,
  ALLOC_ORDER_COLUMN_DEFS,
  ALLOC_ORDER_ITEM_COLUMN_DEFS,
  UNALLOC_ORDER_COLUMN_DEFS,
  ALLOC_ORDER_SUB_COLUMN_DEFS,
  UNALLOC_ORDER_SUB_COLUMN_DEFS,
  VEH_MGMT_COLUMN_DEFS,
} from "./DispatchPlanColumns";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { Lang } from "@/app/services/common/Lang";

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

// detail 탭 정의 — 정적이므로 모듈 상수로 고정(렌더마다 재생성 방지).
const DETAIL_TABS = [
  { key: "STOP", label: "LBL_STOP" },
  { key: "ALLOC", label: "LBL_ASSIGNED_SHIPMENTS" },
  { key: "UNALLOC", label: "LBL_UNASSIGNED_SHIPMENTS" },
  { key: "VEHMGMT", label: "LBL_VEHICLE_MANAGER" },
];

export default function DispatchPlan() {
  const { openPopup, closePopup } = usePopup();

  const model = useDispatchPlanModel(MENU_CODE);
  const ctrl = useDispatchPlanController({ model });

  // 화면(필드 레이아웃)은 공유, 내부 관리(state/setter/검색핸들러/로딩)는 호출부에서 주입.
  const shipmentsSrchCond = (cfg: {
    key: string;
    cond: Record<string, string>;
    setCond: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    onSearch: () => void;
    searching: boolean;
    open: boolean;
    onOpenChange: (next: boolean) => void;
    onFilterChange: () => void;
  }) => {
    const {
      key,
      cond,
      setCond,
      onSearch,
      searching,
      open,
      onOpenChange,
      onFilterChange,
    } = cfg;
    return (
      <InlineSearchCondition
        open={open}
        onOpenChange={onOpenChange}
        onSearch={onSearch}
        searchBtnDisable={searching}
        fields={[
          {
            type: "combo",
            label: "LBL_DATA_FLTR",
            value: cond.SRCH_FILTER ?? "",
            onChange: (v) => {
              setCond((c) => ({
                ...c,
                SRCH_FILTER: v,
              }));
              onFilterChange(); // 필터 재선택 시 관련 그리드 rowData 초기화
            },
            options: [
              { CODE: "ALL", NAME: "-" },
              { CODE: "ITEM", NAME: Lang.get("LBL_SHIP_ITEM") },
            ],
          },
          ...(key === "UNALLOC" && cond.SRCH_FILTER !== "ITEM"
            ? ([
                {
                  type: "combo",
                  label: "LBL_DLVRY_TP",
                  value: cond.DLVRY_TP ?? "",
                  onChange: (v) =>
                    setCond((c) => ({
                      ...c,
                      DLVRY_TP: v,
                    })),
                  options: model.stores.dlvryTpList
                    ? [{ CODE: "ALL", NAME: "-" }, ...model.stores.dlvryTpList]
                    : [],
                },
              ] as GridSearchField[])
            : []),
          ...(cond.SRCH_FILTER === "ITEM"
            ? ([
                {
                  type: "popup",
                  label: "LBL_ITEM_CD",
                  code: cond.ITEM_CD ?? "",
                  name: cond.ITEM_NM_DSP ?? "",
                  onChangeCode: (v) => setCond((c) => ({ ...c, ITEM_CD: v })),
                  onChangeName: (v) =>
                    setCond((c) => ({ ...c, ITEM_NM_DSP: v })),
                  // TODO: 품목 조회 팝업 연결 (선택 시 ITEM_CD/ITEM_NM_DISP 세팅)
                  onClickSearch: () => {
                    openPopup({
                      title: "LBL_ITEM_CD",
                      width: "2xl",
                      content: (
                        <CommonPopup
                          sqlId="selectUnassgnItemCodeName"
                          extraParams={{
                            sqlParam1:
                              model.rawFiltersRef.current
                                .SRCH_DSPCH_LGST_GRP_CD,
                            sqlParam2:
                              model.rawFiltersRef.current.SRCH_DSPCH_PLN_ID,
                            sqlParam3:
                              model.grids.main.selectedRef.current?.DSPCH_NO,
                          }}
                          onApply={(picked: any) => {
                            setCond((c) => ({
                              ...c,
                              ITEM_CD: picked.CODE,
                              ITEM_NM_DSP: picked.NAME,
                            }));
                            closePopup();
                          }}
                          onClose={closePopup}
                        />
                      ),
                    });
                  },
                },
                {
                  type: "text",
                  label: "LBL_ITEM_NAME",
                  value: cond.ITEM_NM ?? "",
                  onChange: (v) => setCond((c) => ({ ...c, ITEM_NM: v })),
                },
                {
                  type: "combo",
                  label: "LBL_DLVRY_TP",
                  value: cond.DLVRY_TP ?? "",
                  onChange: (v) =>
                    setCond((c) => ({
                      ...c,
                      DLVRY_TP: v,
                    })),
                  options: model.stores.dlvryTpList
                    ? [{ CODE: "ALL", NAME: "-" }, ...model.stores.dlvryTpList]
                    : [],
                },
                {
                  type: "popup",
                  label: "LBL_DESTINATION_EX",
                  code: cond.TO_LOC_CD ?? "",
                  name: cond.TO_LOC_NM ?? "",
                  onChangeCode: (v) =>
                    setCond((c) => ({
                      ...c,
                      TO_LOC_CD: v,
                    })),
                  onChangeName: (v) => setCond((c) => ({ ...c, TO_LOC_NM: v })),
                  onClickSearch: () => {
                    openPopup({
                      title: "LBL_DESTINATION_EX",
                      width: "2xl",
                      content: (
                        <CommonPopup
                          sqlId="selectUnassgnItemLocationCodeName"
                          extraParams={{
                            sqlParam1:
                              model.rawFiltersRef.current
                                .SRCH_DSPCH_LGST_GRP_CD,
                            sqlParam2:
                              model.rawFiltersRef.current.SRCH_DSPCH_PLN_ID,
                            sqlParam3: cond.DLVRY_TP,
                            sqlParam4:
                              model.rawFiltersRef.current.SRCH_DSPCH_DLVRY_DT,
                            sqlParam5:
                              model.grids.main.selectedRef.current?.DSPCH_NO,
                          }}
                          onApply={(picked: any) => {
                            setCond((c) => ({
                              ...c,
                              TO_LOC_CD: picked.CODE,
                              TO_LOC_NM: picked.NAME,
                            }));
                            closePopup();
                          }}
                          onClose={closePopup}
                        />
                      ),
                    });
                  },
                },
                {
                  type: "combo",
                  label: "LBL_TEMP_CAL_OPT",
                  value: cond.TEMP_TCD ?? "",
                  onChange: (v) =>
                    setCond((c) => ({
                      ...c,
                      TEMP_TCD: v,
                    })),
                  options: model.stores.vehTempTcd
                    ? [{ CODE: "ALL", NAME: "-" }, ...model.stores.vehTempTcd]
                    : [],
                },
                {
                  type: "combo",
                  label: "LBL_PBOX_TP",
                  value: cond.PBOX_TP ?? "",
                  onChange: (v) => setCond((c) => ({ ...c, PBOX_TP: v })),
                  options: model.stores.pboxTpList
                    ? [{ CODE: "ALL", NAME: "-" }, ...model.stores.pboxTpList]
                    : [],
                },
              ] as GridSearchField[])
            : []),
        ]}
      />
    );
  };

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
            tabs={DETAIL_TABS}
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
                  <div className="flex flex-col h-full min-h-0 gap-2">
                    {shipmentsSrchCond({
                      key: "ALLOC",
                      cond: model.allocCond,
                      setCond: model.setAllocCond,
                      onSearch: ctrl.handleAllocOrderSearch,
                      searching: model.allocSearching,
                      open: model.allocCondOpen,
                      onOpenChange: model.setAllocCondOpen,
                      onFilterChange: () =>
                        ctrl.resetGrids(["allocOrder", "allocSub"]),
                    })}
                    <div className="flex-1 min-h-0">
                      {model.allocCond.SRCH_FILTER === "ITEM" ? (
                        <DataGrid
                          {...model.bind("allocOrder")}
                          authId={AUTH.grids.allocOrder}
                          columnDefs={ALLOC_ORDER_ITEM_COLUMN_DEFS}
                          codeMap={model.codeMap}
                          actions={ctrl.allocOrderActions}
                          onRowClicked={ctrl.onAllocOrderRowClicked}
                          audit={false}
                        />
                      ) : (
                        <SplitPane direction="vertical" defaultSizes={[60, 40]}>
                          <DataGrid
                            {...model.bind("allocOrder")}
                            authId={AUTH.grids.allocOrder}
                            columnDefs={ALLOC_ORDER_COLUMN_DEFS}
                            codeMap={model.codeMap}
                            actions={ctrl.allocOrderActions}
                            onRowClicked={ctrl.onAllocOrderRowClicked}
                            rowSelection="multiple"
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
                      )}
                    </div>
                  </div>
                ),
              },
              UNALLOC: {
                render: () => (
                  <div className="flex flex-col h-full min-h-0 gap-2">
                    {shipmentsSrchCond({
                      key: "UNALLOC",
                      cond: model.unallocCond,
                      setCond: model.setUnallocCond,
                      onSearch: ctrl.handleUnallocOrderSearch,
                      searching: model.unallocSearching,
                      open: model.unallocCondOpen,
                      onOpenChange: model.setUnallocCondOpen,
                      onFilterChange: () =>
                        ctrl.resetGrids(["unallocOrder", "unallocSub"]),
                    })}
                    <div className="flex-1 min-h-0">
                      {model.unallocCond.SRCH_FILTER === "ITEM" ? (
                        <DataGrid
                          {...model.bind("unallocOrder")}
                          authId={AUTH.grids.unallocOrder}
                          columnDefs={ALLOC_ORDER_ITEM_COLUMN_DEFS}
                          codeMap={model.codeMap}
                          actions={ctrl.unallocOrderActions}
                          onRowClicked={ctrl.onUnallocOrderRowClicked}
                          audit={false}
                        />
                      ) : (
                        <SplitPane direction="vertical" defaultSizes={[50, 50]}>
                          <DataGrid
                            {...model.bind("unallocOrder")}
                            authId={AUTH.grids.unallocOrder}
                            columnDefs={UNALLOC_ORDER_COLUMN_DEFS}
                            codeMap={model.codeMap}
                            actions={ctrl.unallocOrderActions}
                            onRowClicked={ctrl.onUnallocOrderRowClicked}
                            rowSelection="multiple"
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
                      )}
                    </div>
                  </div>
                ),
              },
              VEHMGMT: {
                render: () => (
                  <div className="flex flex-col h-full min-h-0 gap-2">
                    <InlineSearchCondition
                      onSearch={ctrl.handleVehMgmtSearch}
                      searchBtnDisable={model.vehMgmtSearching}
                      fields={[
                        {
                          type: "text",
                          label: "LBL_DRIVER_NAME",
                          value: model.vehMgmtCond.DRVR_NM ?? "",
                          onChange: (v) =>
                            model.setVehMgmtCond((c) => ({ ...c, DRVR_NM: v })),
                        },
                      ]}
                    />
                    <div className="flex-1 min-h-0">
                      <DataGrid
                        {...model.bind("vehMgmt")}
                        columnDefs={VEH_MGMT_COLUMN_DEFS}
                        codeMap={model.codeMap}
                        actions={ctrl.vehMgmtActions}
                        rowSelection="multiple"
                        audit={false}
                      />
                    </div>
                  </div>
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
        <VehicleLocationPanel rows={model.vehLocRows} />
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
