// src/views/tender/TenderReceiveDispatch.tsx
// ──────────────────────────────────────────────────────────────────
//  센차 스타일 → React 전환 구조
//
//  [Sencha]                          [React]
//  TenderReceiveDispatch.js    →     TenderReceiveDispatch.tsx   (루트 View)
//  TenderReceiveDispatchController.js→ TenderReceiveDispatchController.ts
//  TenderReceiveDispatchModel.js   →  TenderReceiveDispatchModel.ts
//  TenderReceiveDispatchMain.js    ┐
//  TenderReceiveDispatchSub01.js   │→ TenderReceiveDispatchColumns.ts
//  TenderReceiveDispatchSub04.js   │   (컬럼 정의 모아서 관리)
//  TenderReceiveDispatchCarrRate.js┘
// ──────────────────────────────────────────────────────────────────
"use client";

import { useRef } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Skeleton } from "@/app/components/ui/skeleton";
import { SearchFilters } from "@/app/components/Search/SearchFilters.tsx";
import { TENDER_SEARCH_META } from "./tenderSearchMeta";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";
import {
  LayoutToggleButton,
  LayoutType,
} from "@/app/components/layout/LayoutToggleButton";

// ── 분리된 모듈 ───────────────────────────────────────────────────
import { useTenderReceiveDispatchModel } from "./TenderReceiveDispatchModel";
import { useTenderReceiveDispatchController } from "./TenderReceiveDispatchController.tsx";
import {
  MAIN_COLUMN_DEFS,
  STOP_COLUMN_DEFS,
  SMS_COLUMN_DEFS,
  AP_SETL_COLUMN_DEFS,
} from "./TenderReceiveDispatchColumns.tsx";
// ─────────────────────────────────────────────────────────────────

export default function TenderReceiveDispatch() {
  // 센차 expanelsrch 메타 로드 (콤보/팝업 옵션 포함)
  const { meta, loading } = useSearchMeta(TENDER_SEARCH_META);

  // 센차 ViewModel → React state/ref 묶음
  const model = useTenderReceiveDispatchModel();

  // SearchFilters ↔ DataGrid 연결용 ref
  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});

  // 센차 Controller → 버튼/이벤트 핸들러 묶음
  const ctrl = useTenderReceiveDispatchController({
    model,
    searchRef,
    filtersRef,
  });

  if (loading) {
    return <Skeleton className="h-24" />;
  }

  return (
    <div className="flex flex-col gap-3 h-full min-h-0 min-w-0">
      {/* ── 조회조건 (센차: region:'north', xtype:'expanelsrch') ── */}
      <SearchFilters
        meta={meta}
        onSearch={ctrl.handleSearch}
        searchRef={searchRef}
        filtersRef={filtersRef}
        pageSize={model.pageSize}
        fetchFn={ctrl.fetchDispatchList}
        layoutToggle={
          <LayoutToggleButton
            layout={model.layout}
            onToggle={() =>
              model.setLayout((prev: LayoutType) =>
                prev === "side" ? "vertical" : "side"
              )
            }
          />
        }
      />

      {/* ── 그리드 영역 (센차: border layout, height:'60%' north + center) ── */}
      <div className="flex-1 min-h-0 min-w-0 overflow-x-visible">
        <PanelGroup
          direction={model.layout === "side" ? "horizontal" : "vertical"}
          className="h-full w-full min-h-0 min-w-0"
        >
          {/* ── 메인 그리드 (센차: TenderReceiveDispatchMain, xtype:'tenderreceivedispatchmain') ── */}
          <Panel defaultSize={50} minSize={20} className="min-h-0 min-w-0">
            <div className="h-full flex flex-col overflow-hidden">
              <DataGrid
                layoutType="plain"
                columnDefs={MAIN_COLUMN_DEFS(model.codeMap)}
                rowData={model.gridData.rows}
                totalCount={model.gridData.totalCount}
                currentPage={model.gridData.page}
                pageSize={model.pageSize}
                onPageSizeChange={model.setPageSize}
                onPageChange={(page) => {
                  model.resetSubGrids();
                  searchRef.current?.(page, false);
                }}
                actions={ctrl.mainActions}
                onRowClicked={ctrl.handleRowClicked}
              />
            </div>
          </Panel>

          <PanelResizeHandle
            className={
              model.layout === "side"
                ? "w-2 cursor-col-resize hover:bg-slate-200/70"
                : "h-2 cursor-row-resize hover:bg-slate-200/70"
            }
          />

          {/* ── 서브 탭 패널 (센차: xtype:'extabpanel', region:'center') ── */}
          {/* Tab1: 경유처      (센차: TenderReceiveDispatchSub01)           */}
          {/* Tab2: SMS전송이력  (센차: TenderReceiveDispatchSub04)           */}
          {/* Tab3: 운송비내역  (센차: TenderReceiveDispatchCarrRate)         */}
          <Panel defaultSize={50} minSize={20} className="min-h-0 min-w-0">
            <div className="h-full flex flex-col overflow-hidden">
              <DataGrid
                layoutType="tab"
                tabs={[
                  { key: "STOP",    label: "경유처" },
                  { key: "SMS_HIS", label: "SMS전송이력" },
                  { key: "AP_SETL", label: "운송비내역" },
                ]}
                presets={{
                  STOP: {
                    columnDefs: STOP_COLUMN_DEFS,
                  },
                  SMS_HIS: {
                    columnDefs: SMS_COLUMN_DEFS,
                  },
                  AP_SETL: {
                    gridRef: model.apSetlGridRef,
                    columnDefs: AP_SETL_COLUMN_DEFS(model.setSubApSetlRowData),
                    onCellValueChanged: ctrl.handleApSetlCellChange,
                    actions: ctrl.apSetlActions,
                  },
                }}
                rowData={{
                  STOP:    model.subStopRowData,
                  SMS_HIS: model.subSmsHisRowData,
                  AP_SETL: model.subApSetlRowData,
                }}
                actions={[]}
              />
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* ── 추적 슬라이드 패널 (메인 "+ 추적" 버튼 클릭 시 표시) ── */}
      <div
        className={`shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
          model.trackOpen ? "h-[280px] opacity-100" : "h-0 opacity-0"
        }`}
      >
        <div className="h-full border border-gray-200 rounded-lg overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[rgb(var(--primary))] shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-white uppercase tracking-wider">
                추적 결과
              </span>
              {model.trackRows.length > 0 && (
                <span className="text-[11px] text-white/70">
                  {model.trackRows
                    .map((r: any) => r.DSPCH_NO)
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
            </div>
            <button
              onClick={() => model.setTrackOpen(false)}
              className="text-[11px] text-white/70 hover:text-white px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
            >
              닫기
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <DataGrid
              layoutType="plain"
              actions={[]}
              columnDefs={STOP_COLUMN_DEFS.slice(0, 10)}
              rowData={model.subStopRowData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
