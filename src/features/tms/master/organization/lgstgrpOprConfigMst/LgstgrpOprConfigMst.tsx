// src/features/tms/master/organization/lgstgrpOprConfigMst/LgstgrpOprConfigMst.tsx
"use client";

import { useRef, useEffect } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useLgstgrpOprConfigMstModel } from "./LgstgrpOprConfigMstModel";
import { useLgstgrpOprConfigMstController } from "./LgstgrpOprConfigMstController";
import {
  CONFIG_COLUMN_DEFS,
  CONFIG_DETAIL_COLUMN_DEFS,
  CONFIG_I18N_COLUMN_DEFS,
  CONFIG_DETAIL_I18N_COLUMN_DEFS,
} from "./LgstgrpOprConfigMstColumns.tsx";

export const MENU_CODE = "MENU_LGSTGRP_OPR_CONFIG_MST";

type ConfigTab = { key: string; label: string };

export default function LgstgrpOprConfigMst() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});

  const model = useLgstgrpOprConfigMstModel();
  const ctrl = useLgstgrpOprConfigMstController({
    model,
    searchRef,
    filtersRef,
  });

  // 탭 변경 시 4 그리드 초기화 + 재조회
  const isTabInit = useRef(true);
  useEffect(() => {
    if (isTabInit.current) {
      isTabInit.current = false;
      return;
    }
    if (!model.activeTab) return;
    model.resetSubGrids();
    model.grids.config.setData({ rows: [], totalCount: 0, page: 1, limit: 20 });
    setTimeout(() => searchRef.current?.(1), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.activeTab]);

  if (loading) return <Skeleton className="h-24" />;

  // 외부 탭 네비
  const tabNav = (
    <div className="flex gap-0.5 border-b border-border px-1">
      {model.configTabs.map((tab: ConfigTab) => (
        <button
          key={tab.key}
          onClick={() => model.setActiveTab(tab.key)}
          className={`
            px-3 py-1.5 text-[11px] font-medium border-b-2 transition-colors
            ${
              model.activeTab === tab.key
                ? "text-[rgb(var(--primary))] border-[rgb(var(--primary))]"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

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
      topSlot={tabNav}
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
