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
import { TrackPanel } from "@/app/components/track/TrackPanel";

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
          columnDefs={MAIN_COLUMN_DEFS()}
          rowData={model.gridData.rows}
          totalCount={model.gridData.totalCount}
          currentPage={model.gridData.page}
          pageSize={model.pageSize}
          onPageSizeChange={model.setPageSize}
          onPageChange={(page) => {
            model.resetSubGrids();
            searchRef.current?.(page);
          }}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.handleRowClicked}
          codeMap={model.codeMap}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "STOP", label: "LBL_STOP" },
            { key: "SMS_HIS", label: "LBL_SMS_HISTORY" },
            { key: "AP_SETL", label: "LBL_TRANS_COST_HIS" },
          ]}
          presets={{
            STOP: { columnDefs: STOP_COLUMN_DEFS() },
            SMS_HIS: { columnDefs: SMS_COLUMN_DEFS() },
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
          codeMap={model.codeMap}
        />
      }
      bottomSlot={
        <TrackPanel
          open={model.trackOpen}
          onClose={() => model.setTrackOpen(false)}
          dspchNos={model.trackDspchNos}
          trackType={model.trackType}
        />
      }
      bottomOpen={model.trackOpen}
      bottomHeight={280}
    />
  );
}
