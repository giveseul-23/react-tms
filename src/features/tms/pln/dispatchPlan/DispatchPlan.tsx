"use client";

import { useState, useEffect } from "react";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { ContentSidePanel } from "@/app/components/layout/ContentSidePanel";
import VehicleLocationSidePanel from "@/app/components/map/VehicleLocationSidePanel";
import DriveRoutePanel from "./panel/DriveRoutePanel";
import { dispatchPlanApi as locApi } from "./dispatchPlanApi";
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

// 차량위치 패널 위치 조회 — 차량별 getVehiclePosition 을 모아서 수행
const fetchVehPositions = (ids: string[]) =>
  Promise.all(
    ids.map((id) =>
      locApi
        .getVehiclePosition(id)
        .then((res: any) => res.data?.result ?? res.data?.data?.dsOut ?? [])
        .catch(() => []),
    ),
  ).then((lists) => lists.flat());

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

  // ── 차량정보(vehMgmt) → 메인 드래그드랍 → 신규배차생성 ──────────────
  // 두 그리드 GridApi 확보 후, vehMgmt 행을 메인 드롭존에 떨어뜨리면 ctrl.onVehMgmtDropToMain 호출.
  // (vehMgmt 그리드는 rowDragMultiRow 로 선택행 전체를 드래그 — 드롭존 onDragStop 의 nodes 가 전체)
  const [mainApi, setMainApi] = useState<any>(null);
  const [vehMgmtApi, setVehMgmtApi] = useState<any>(null);
  const [unallocApi, setUnallocApi] = useState<any>(null);
  useEffect(() => {
    if (!mainApi || mainApi.isDestroyed?.()) return;
    const rowsOf = (p: any) => (p?.nodes ?? []).map((n: any) => n.data);
    const zones: Array<{ src: any; zone: any }> = [];
    // 차량정보 → 메인: 타겟 무관, 신규배차생성
    if (vehMgmtApi && !vehMgmtApi.isDestroyed?.()) {
      const z = mainApi.getRowDropZoneParams({
        onDragStop: (p: any) => ctrl.onVehMgmtDropToMain(rowsOf(p)),
      });
      vehMgmtApi.addRowDropZone(z);
      zones.push({ src: vehMgmtApi, zone: z });
    }
    // 미할당주문 → 메인: 드롭한 타겟 배차행(overNode)에 할당 (타겟 필수)
    if (unallocApi && !unallocApi.isDestroyed?.()) {
      const z = mainApi.getRowDropZoneParams({
        onDragStop: (p: any) =>
          ctrl.onUnallocDropToMain(rowsOf(p), p?.overNode?.data ?? null),
      });
      unallocApi.addRowDropZone(z);
      zones.push({ src: unallocApi, zone: z });
    }
    return () => {
      zones.forEach(({ src, zone }) => {
        try {
          if (!src.isDestroyed?.()) src.removeRowDropZone?.(zone);
        } catch {
          /* 그리드 파괴 시 무시 */
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainApi, vehMgmtApi, unallocApi]);

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
            onSelectionRowsChanged={ctrl.onMainSelectionForVehLoc}
            onApiReady={setMainApi}
            rowSelection="multiple"
            audit={{ delete: false }}
          />
        }
        detail={
          <DataGrid
            layoutType="tab"
            tabs={DETAIL_TABS}
            onTabChange={ctrl.onDetailTabChange}
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
                      onSearch: () => ctrl.handleAllocOrderSearch(),
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
                          rowSelection="multiple"
                          rowDrag
                          onApiReady={setUnallocApi}
                          gridOptions={{ rowDragMultiRow: true, rowDragEntireRow: true }}
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
                            rowDrag
                            onApiReady={setUnallocApi}
                            gridOptions={{ rowDragMultiRow: true, rowDragEntireRow: true }}
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
                        rowDrag
                        onApiReady={setVehMgmtApi}
                        gridOptions={{ rowDragMultiRow: true, rowDragEntireRow: true }}
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

      <VehicleLocationSidePanel
        open={model.vehLocPanelOpen}
        onClose={() => model.setVehLocPanelOpen(false)}
        vehIds={(model.vehLocRows ?? [])
          .map((r: any) => r?.VEH_ID)
          .filter(Boolean)
          .map(String)}
        fetchPositions={fetchVehPositions}
        emptyText="배차를 선택하세요."
      />

      <ContentSidePanel
        open={model.routePanelOpen}
        onClose={() => model.setRoutePanelOpen(false)}
        title="BTN_SHOW_ROUTE"
        width={520}
      >
        <DriveRoutePanel row={model.grids.main.selected} />
      </ContentSidePanel>
    </>
  );
}
