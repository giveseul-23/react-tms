// src/views/tender/TenderReceiveDispatch.tsx
"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";
import { useSearchCondition } from "@/hooks/useSearchCondition";

import { useTenderReceiveDispatchModel } from "./TenderReceiveDispatchModel.ts";
import { useTenderReceiveDispatchController } from "./TenderReceiveDispatchController.tsx";
import {
  MAIN_COLUMN_DEFS,
  STOP_COLUMN_DEFS,
  SMS_COLUMN_DEFS,
  AP_SETL_COLUMN_DEFS,
} from "./TenderReceiveDispatchColumns.tsx";

export const MENU_CD = "MENU_PLAN_TENDER_RECEIVE";

export default function TenderReceiveDispatch() {
  const { meta, loading } = useSearchMeta(MENU_CD);
  const model = useTenderReceiveDispatchModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  useSearchCondition({
    meta,
    excludeKeysRef,
    filtersRef,
    excludes: ["BOOKING"],
  });

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
    <MasterDetailPage
      searchProps={{
        meta,
        fetchFn: ctrl.fetchDispatchList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        pageSize: model.pageSize,
        excludeKeysRef,
        menuCode: MENU_CD,
      }}
      direction={model.layout === "side" ? "horizontal" : "vertical"}
      layoutToggle={{
        layout: model.layout,
        onToggle: () =>
          model.setLayout((prev: LayoutType) =>
            prev === "side" ? "vertical" : "side",
          ),
      }}
      storageKey="tender-receive-dispatch"
      master={
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
      }
      detail={
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
      }
      bottomSlot={trackPanelContent}
      bottomOpen={model.trackOpen}
      bottomHeight={280}
    />
  );
}
