"use client";

// 배차상세정보 팝업 — 배차상세정보.JPG 레이아웃. (View)
//  상단: 조회조건 카드(차량번호/운전자명/차량유형명) — 표준 PopupSearchCondition
//  본문: 좌(배차정보+배송경로) / 우(할당·미할당 주문 탭 + 품목) — SplitPane 으로 분할 조정
//  툴바: 표준 DataGrid actions(GridActionsBar) — 라벨 키는 Sencha DispatchDetailPop 기준
//  데이터: 배차행 선택 → 배송경로/할당주문(+첫행 품목) 조회. 미할당주문은 배송유형 조건 조회(+첫행 품목).
//  상태는 useDispatchDetailPopModel, 로직/액션은 useDispatchDetailPopController 가 담당.

import DataGrid from "@/app/components/grid/DataGrid";
import { PopupSearchCondition } from "@/app/components/popup/PopupSearchCondition";
import { InlineSearchCondition } from "@/app/components/Search/InlineSearchCondition";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { useDispatchDetailPopModel } from "@/app/components/popup/dispatchDetail/DispatchDetailPopModel";
import { useDispatchDetailPopController } from "@/app/components/popup/dispatchDetail/DispatchDetailPopController";
import {
  ROUTE_COLS,
  ORDER_COLS,
  ITEM_COLS,
  ORDER_TABS,
} from "@/app/components/popup/dispatchDetail/DispatchDetailPopColumns";

type Props = {
  onClose: () => void;
  /** 팝업이 닫힐 때(언마운트) 1회 호출 — 메인 화면 전체 재조회용. */
  onClosed?: () => void;
  /** 더블클릭한 행의 배차번호 — 고정차량은 첫 회전 배차키, 용차는 DSPCH_NO. */
  initValue?: Record<string, string>;
  /** 임시용차(계약차)에서 열렸는지 — true 면 배차생성/저장 버튼 숨김(센차 cntrVeh). */
  cntrVeh?: boolean;
};

export default function DispatchDetailPop({
  onClosed,
  initValue,
  cntrVeh = false,
}: Props) {
  const model = useDispatchDetailPopModel(initValue, onClosed);
  const ctrl = useDispatchDetailPopController({ model, initValue, cntrVeh });

  const {
    vehNo,
    setVehNo,
    drvrNm,
    setDrvrNm,
    vehTpCd,
    setVehTpCd,
    dspchRowData,
    setDspchRowData,
    routeRowData,
    setRouteRowData,
    assignShpmRow,
    setAssignShpmRow,
    assignItemRow,
    unAssignShpmRow,
    setUnAssignShpmRow,
    unAssignItemRow,
    setUnAssignItemRow,
    unAssignSearching,
    unallocCond,
    setUnallocCond,
    unallocCondOpen,
    setUnallocCondOpen,
    stores,
    codeMap,
    editingRidRef,
    dspchMasking,
    routeMasking,
    allocMasking,
    unallocMasking,
  } = model;

  return (
    <div className="flex flex-col gap-2 w-full" style={{ height: "74vh" }}>
      {/* 상단 조회조건 — 표준 카드형 (PopupSearchCondition) */}
      <PopupSearchCondition
        columns={4}
        fields={[
          {
            label: "LBL_VEH_NO",
            type: "text",
            value: vehNo,
            onChange: setVehNo,
            disable: true,
          },
          {
            label: "LBL_DRIVER_NAME",
            type: "text",
            value: drvrNm,
            onChange: setDrvrNm,
            disable: true,
          },
          {
            label: "LBL_VEHICLE_TYPE_NAME",
            type: "combo",
            value: vehTpCd,
            onChange: setVehTpCd,
            options: stores.vehTpCd,
            disable: true,
          },
        ]}
      />

      {/* 본문 2단 — SplitPane 으로 좌/우 분할 조정 */}
      <div className="flex-1 min-h-0">
        <SplitPane
          direction="horizontal"
          defaultSizes={[60, 40]}
          minSizes={[30, 25]}
          storageKey="DSPCH_DETAIL_POP_SPLIT"
        >
          {/* 좌: 배차정보 + 배송경로 — 세로 분할(서로 크기 조정) */}
          <div className="h-full min-h-0">
            <SplitPane
              direction="vertical"
              defaultSizes={[50, 50]}
              storageKey="DSPCH_DETAIL_POP_LEFT_SPLIT"
            >
              <DataGrid
                layoutType="plain"
                subTitle="LBL_DISPATCH_LIST"
                actions={ctrl.dspchActions}
                columnDefs={ctrl.dspchCols}
                rowData={dspchRowData}
                setRowData={setDspchRowData}
                codeMap={codeMap}
                rowSelection="multiple"
                enableClickSelection
                onRowClicked={ctrl.loadSub}
                onSelectionRowsChanged={ctrl.onDspchSelectionRows}
                loading={dspchMasking}
                audit={false}
                gridOptions={{
                  // 사유(RSN) 편집 시작/종료 추적 — 편집 중 에러 마커 숨김.
                  onCellEditingStarted: (e: any) => {
                    if (e.column?.getColId?.() === "CONSTRAINT_OVRD_RSN_CD")
                      editingRidRef.current = e.data?.__rid__ ?? null;
                  },
                  onCellEditingStopped: (e: any) => {
                    if (e.column?.getColId?.() === "CONSTRAINT_OVRD_RSN_CD") {
                      editingRidRef.current = null;
                      e.api.refreshCells({
                        rowNodes: e.node ? [e.node] : undefined,
                        columns: ["CONSTRAINT_OVRD_RSN_CD"],
                        force: true,
                      });
                    }
                  },
                }}
              />
              <DataGrid
                layoutType="plain"
                subTitle="LBL_TRANSPORTATION_ROUTE"
                actions={ctrl.routeActions}
                columnDefs={ROUTE_COLS}
                codeMap={codeMap}
                rowData={routeRowData}
                setRowData={setRouteRowData}
                loading={routeMasking}
                rowSelection="single"
                audit={false}
              />
            </SplitPane>
          </div>

          {/* 우: 주문(할당/미할당) 탭 — 각 탭 = 주문 그리드 + 품목 그리드(세로 분할) */}
          <div className="h-full flex flex-col gap-2 min-h-0">
            <DataGrid
              layoutType="tab"
              tabs={ORDER_TABS}
              // 미할당주문 탭 활성화 시 자동 조회
              onTabChange={(k) => {
                if (k === "UNALLOC") ctrl.handleUnallocOrderSearch();
              }}
              presets={{
                // 할당주문 — 조회조건 없음
                ALLOC: {
                  render: () => (
                    <SplitPane direction="vertical" defaultSizes={[60, 40]}>
                      <DataGrid
                        layoutType="plain"
                        subTitle="LBL_ASSIGNED_SHIPMENTS"
                        actions={ctrl.allocActions}
                        columnDefs={ORDER_COLS}
                        codeMap={codeMap}
                        rowData={assignShpmRow}
                        setRowData={setAssignShpmRow}
                        rowSelection="multiple"
                        onRowClicked={ctrl.loadAssignItems}
                        loading={allocMasking}
                        audit={false}
                      />
                      <DataGrid
                        layoutType="plain"
                        subTitle="LBL_ITEM_INFO"
                        actions={[]}
                        codeMap={codeMap}
                        columnDefs={ITEM_COLS}
                        rowData={assignItemRow}
                        audit={false}
                      />
                    </SplitPane>
                  ),
                },
                // 미할당주문 — 배송유형 조회조건만
                UNALLOC: {
                  render: () => (
                    <div className="flex flex-col h-full min-h-0 gap-2">
                      <InlineSearchCondition
                        open={unallocCondOpen}
                        onOpenChange={setUnallocCondOpen}
                        onSearch={ctrl.handleUnallocOrderSearch}
                        searchBtnDisable={unAssignSearching}
                        fields={[
                          {
                            type: "combo",
                            label: "LBL_DLVRY_TP",
                            value: unallocCond.DLVRY_TP ?? "",
                            onChange: (v) =>
                              setUnallocCond((c) => ({ ...c, DLVRY_TP: v })),
                            options: stores.dlvryTpList
                              ? [
                                  { CODE: "ALL", NAME: "-" },
                                  ...stores.dlvryTpList,
                                ]
                              : [],
                          },
                        ]}
                      />
                      <div className="flex-1 min-h-0">
                        <SplitPane direction="vertical" defaultSizes={[60, 40]}>
                          <DataGrid
                            layoutType="plain"
                            subTitle="LBL_UNASSIGNED_SHIPMENTS"
                            actions={ctrl.unallocActions}
                            columnDefs={ORDER_COLS}
                            codeMap={codeMap}
                            rowData={unAssignShpmRow}
                            setRowData={setUnAssignShpmRow}
                            rowSelection="multiple"
                            onRowClicked={ctrl.loadUnAssignItems}
                            onRowDoubleClicked={ctrl.onUnallocRowDblClick}
                            loading={unallocMasking}
                            audit={false}
                          />
                          <DataGrid
                            layoutType="plain"
                            subTitle="LBL_ITEM_INFO"
                            actions={ctrl.unallocSubActions}
                            columnDefs={ITEM_COLS}
                            codeMap={codeMap}
                            rowData={unAssignItemRow}
                            setRowData={setUnAssignItemRow}
                            rowSelection="single"
                            audit={false}
                          />
                        </SplitPane>
                      </div>
                    </div>
                  ),
                },
              }}
              audit={false}
            />
          </div>
        </SplitPane>
      </div>
    </div>
  );
}
