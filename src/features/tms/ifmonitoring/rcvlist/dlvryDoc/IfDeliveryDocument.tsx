"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useIfDeliveryDocumentModel } from "./IfDeliveryDocumentModel";
import { useIfDeliveryDocumentController } from "./IfDeliveryDocumentController";
import {
  MAIN_COLUMN_DEFS,
  DETAIL_COLUMN_DEFS,
} from "./IfDeliveryDocumentColumns";

const MENU_CODE = "MENU_IF_RCV_DLVRY_DOC";

export default function IfDeliveryDocument() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useIfDeliveryDocumentModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  const ctrl = useIfDeliveryDocumentController({
    model,
    searchRef,
    filtersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <MasterDetailPage
      defaultSizes={[55, 45]}
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
      storageKey="if-delivery-document"
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
          tabs={[{ key: "DETAIL", label: "납품상세" }]}
          presets={{
            DETAIL: {
              columnDefs: DETAIL_COLUMN_DEFS,
              actions: ctrl.detailActions,
            },
          }}
          rowData={{ DETAIL: model.detailRowData }}
          actions={[]}
        />
      }
    />
  );
}
