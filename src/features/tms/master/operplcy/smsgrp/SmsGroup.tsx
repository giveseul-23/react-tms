"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useSmsGroupModel } from "./SmsGroupModel.ts";
import { useSmsGroupController } from "./SmsGroupController.tsx";
import {
  MAIN_COLUMN_DEFS,
  DETAIL_COLUMN_DEFS,
  NTFC_CHANNEL_COLUMN_DEFS,
  NTFC_TARGET_COLUMN_DEFS,
} from "./SmsGroupColumns.tsx";

const MENU_CODE = "MENU_VLTN_NTFCTN_CNFG";

export default function TenderReceiveDispatch() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useSmsGroupModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  const ctrl = useSmsGroupController({
    model,
    searchRef,
    filtersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <MasterDetailPage
      defaultSizes={[40, 60]}
      searchProps={{
        meta,
        fetchFn: ctrl.fetchDispatchList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        pageSize: model.pageSize,
        excludeKeysRef,
      }}
      direction={model.layout === "side" ? "horizontal" : "vertical"}
      layoutToggle={{
        layout: model.layout,
        onToggle: () =>
          model.setLayout((prev: LayoutType) =>
            prev === "side" ? "vertical" : "side",
          ),
      }}
      storageKey="division-default-dispatch"
      master={
        <DataGrid
          layoutType="plain"
          columnDefs={MAIN_COLUMN_DEFS}
          rowData={model.gridData.rows}
          onRowClicked={ctrl.handleRowClicked}
        />
      }
      detail={
        <DataGrid
          layoutType="plain"
          columnDefs={DETAIL_COLUMN_DEFS(model.codeMap)}
          rowData={model.subDetailRowData}
          totalCount={model.subDetailRowData.totalCount}
          currentPage={model.subDetailRowData.page}
          pageSize={model.pageSize}
          onPageSizeChange={model.setPageSize}
          onPageChange={(page) => {
            model.resetSubGrids();
            searchRef.current?.(page, false);
          }}
          actions={ctrl.detailActions}
          onRowClicked={ctrl.handleSubRowClicked}
        />
      }
    />
  );
}
