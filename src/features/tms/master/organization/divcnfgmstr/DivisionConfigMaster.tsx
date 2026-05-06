"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useDivisionConfigMasterModel } from "./DivisionConfigMasterModel";
import { useDivisionConfigMasterController } from "./DivisionConfigMasterController";
import {
  CONFIG_COLUMN_DEFS,
  CONFIG_DETAIL_COLUMN_DEFS,
  CONFIG_I18N_COLUMN_DEFS,
  CONFIG_DETAIL_I18N_COLUMN_DEFS,
} from "./DivisionConfigMasterColumns.tsx";

export const MENU_CODE = "MENU_DIV_OPR_CONFIG_MST";

export default function DivisionConfigMaster() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});

  const model = useDivisionConfigMasterModel();
  const ctrl = useDivisionConfigMasterController({
    model,
    searchRef,
    filtersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <MasterDetailPage
      searchProps={{
        meta,
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        pageSize: model.pageSize,
      }}
      direction="vertical"
      defaultSizes={[55, 45]}
      storageKey="lgstgrp-opr-config-mst-outer"
      master={
        <SplitPane
          direction="horizontal"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey="lgstgrp-opr-config-mst-top"
        >
          <DataGrid
            {...ctrl.bind("config", CONFIG_COLUMN_DEFS, {
              actions: ctrl.configActions,
            })}
          />
          <DataGrid {...ctrl.bind("detail", CONFIG_DETAIL_COLUMN_DEFS)} />
        </SplitPane>
      }
      detail={
        <SplitPane
          direction="horizontal"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey="lgstgrp-opr-config-mst-bottom"
        >
          <DataGrid {...ctrl.bind("i18n", CONFIG_I18N_COLUMN_DEFS)} />
          <DataGrid
            {...ctrl.bind("detailI18n", CONFIG_DETAIL_I18N_COLUMN_DEFS)}
          />
        </SplitPane>
      }
    />
  );
}
