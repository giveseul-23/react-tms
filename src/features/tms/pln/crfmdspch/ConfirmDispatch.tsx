"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useConfirmDispatchModel } from "./ConfirmDispatchModel";
import { useConfirmDispatchController } from "./ConfirmDispatchController";
import {
  MAIN_COLUMN_DEFS,
  ORDER_COLUMN_DEFS,
  ORDER_ITEM_COLUMN_DEFS,
  RECEIPT_COLUMN_DEFS,
  RECEIPT_HISTORY_COLUMN_DEFS,
} from "./ConfirmDispatchColumns";

const MENU_CODE = "MENU_ASSIGN_CONFIRM";

export default function ConfirmDispatch() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useConfirmDispatchModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  const ctrl = useConfirmDispatchController({
    model,
    searchRef,
    filtersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <MasterDetailPage
      defaultSizes={[50, 50]}
      searchProps={{
        meta,
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
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
      storageKey="confirm-dispatch"
      master={
        <DataGrid
          layoutType="plain"
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          rowData={model.gridData.rows}
          totalCount={model.gridData.totalCount}
          currentPage={model.gridData.page}
          pageSize={model.pageSize}
          onPageSizeChange={model.setPageSize}
          onPageChange={(page) => {
            model.resetSubGrids();
            searchRef.current?.(page);
          }}
          onRowClicked={ctrl.handleRowClicked}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "ORDER", label: "주문정보" },
            { key: "RECEIPT", label: "인수증" },
            { key: "HISTORY", label: "인수증 발행이력" },
          ]}
          presets={{
            ORDER: {
              columnDefs: ORDER_COLUMN_DEFS,
              actions: ctrl.orderActions,
              onRowClicked: ctrl.handleOrderRowClicked,
            },
            RECEIPT: {
              columnDefs: RECEIPT_COLUMN_DEFS,
              actions: ctrl.receiptActions,
            },
            HISTORY: {
              columnDefs: RECEIPT_HISTORY_COLUMN_DEFS,
              actions: ctrl.receiptHistoryActions,
            },
          }}
          rowData={{
            ORDER: model.orderRowData,
            RECEIPT: model.receiptRowData,
            HISTORY: model.receiptHistoryRowData,
          }}
          codeMap={model.codeMap}
          actions={[]}
          renderRightGrid={(activeTabKey) => {
            if (activeTabKey === "ORDER") {
              return (
                <DataGrid
                  layoutType="plain"
                  columnDefs={ORDER_ITEM_COLUMN_DEFS}
                  rowData={model.orderItemRowData}
                  actions={ctrl.orderItemActions}
                />
              );
            }
            return null;
          }}
        />
      }
    />
  );
}
