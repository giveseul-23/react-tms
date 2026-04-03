// src/views/tender/TenderReceiveDispatch.tsx
"use client";

import { useRef, useEffect } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { StandardPageLayout } from "@/app/components/layout/StandardPageLayout";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useTenderReceiveDispatchModel } from "./TenderReceiveDispatchModel";
import { useTenderReceiveDispatchController } from "./TenderReceiveDispatchController.tsx";
import {
  MAIN_COLUMN_DEFS,
  STOP_COLUMN_DEFS,
  SMS_COLUMN_DEFS,
  AP_SETL_COLUMN_DEFS,
} from "./TenderReceiveDispatchColumns.tsx";

const MENU_CODE = "MENU_PLAN_TENDER_RECEIVE";

export default function TenderReceiveDispatch() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useTenderReceiveDispatchModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    excludeKeysRef.current.add("BOOKING");
  }, []);

  const ctrl = useTenderReceiveDispatchController({
    model,
    searchRef,
    filtersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  // ── 하단 추적 패널 렌더 ─────────────────────────────────────
  const trackPanelContent = (
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
  );

  return (
    <StandardPageLayout
      // 조회조건
      meta={meta}
      fetchFn={ctrl.fetchDispatchList}
      onSearch={ctrl.handleSearch}
      searchRef={searchRef}
      filtersRef={filtersRef}
      pageSize={model.pageSize}
      excludeKeysRef={excludeKeysRef}
      // 레이아웃 토글 (그리드 2개 → visible=true 자동)
      layout={model.layout}
      onLayoutToggle={() =>
        model.setLayout((prev: LayoutType) =>
          prev === "side" ? "vertical" : "side",
        )
      }
      // 분할 그리드
      dualGrid={{
        direction: model.layout === "side" ? "horizontal" : "vertical",
        top: (
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
        ),
        bottom: (
          <DataGrid
            layoutType="tab"
            tabs={[
              { key: "STOP", label: "경유처" },
              { key: "SMS_HIS", label: "SMS전송이력" },
              { key: "AP_SETL", label: "운송비내역" },
            ]}
            presets={{
              STOP: { columnDefs: STOP_COLUMN_DEFS },
              SMS_HIS: { columnDefs: SMS_COLUMN_DEFS },
              AP_SETL: {
                gridRef: model.apSetlGridRef,
                columnDefs: AP_SETL_COLUMN_DEFS(model.setSubApSetlRowData),
                onCellValueChanged: ctrl.handleApSetlCellChange,
                actions: ctrl.apSetlActions,
              },
            }}
            rowData={{
              STOP: model.subStopRowData,
              SMS_HIS: model.subSmsHisRowData,
              AP_SETL: model.subApSetlRowData,
            }}
            actions={[]}
          />
        ),
      }}
      // 하단 슬라이드 패널 (추적)
      bottomPanel={{
        open: model.trackOpen,
        height: 280,
        render: trackPanelContent,
      }}
    />
  );
}
