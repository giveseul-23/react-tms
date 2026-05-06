"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useDivisionDefaultModel } from "./DivisionDefaultModel.ts";
import { useDivisionDefaultController } from "./DivisionDefaultController.tsx";
import {
  MAIN_COLUMN_DEFS,
  DETAIL_COLUMN_DEFS,
} from "./DivisionDefaultColumns.tsx";

export const MENU_CODE = "MENU_ORGANIZATION_ENV_DIV_DFT";

export default function TenderReceiveDispatch() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useDivisionDefaultModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});

  const ctrl = useDivisionDefaultController({
    model,
    searchRef,
    filtersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <MasterDetailPage
      defaultSizes={[10, 90]}
      searchProps={{
        meta,
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        pageSize: model.pageSize,
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
          {...ctrl.bind("main", MAIN_COLUMN_DEFS, {
          })}
        />
      }
      detail={
        <DataGrid
          {...ctrl.bind("detail", DETAIL_COLUMN_DEFS, {
          })}
        />
      }
    />
  );
}
