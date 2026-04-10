// src/views/lgstgrpOprConfigMst/LgstgrpOprConfigMst.tsx
"use client";

import { useRef } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Skeleton } from "@/app/components/ui/skeleton";
import { SearchFilters } from "@/app/components/Search/SearchFilters";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useLgstgrpOprConfigMstModel } from "./LgstgrpOprConfigMstModel";
import { useLgstgrpOprConfigMstController } from "./LgstgrpOprConfigMstController";
import {
  CONFIG_COLUMN_DEFS,
  CONFIG_DETAIL_COLUMN_DEFS,
  CONFIG_I18N_COLUMN_DEFS,
  CONFIG_DETAIL_I18N_COLUMN_DEFS,
} from "./LgstgrpOprConfigMstColumns";

const MENU_CODE = "MENU_LGSTGRP_OPR_CONFIG_MST";

export default function LgstgrpOprConfigMst() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useLgstgrpOprConfigMstModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});

  const ctrl = useLgstgrpOprConfigMstController({
    model,
    searchRef,
    filtersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <div className="flex flex-col gap-3 h-full min-h-0 min-w-0">
      {/* ── 조회조건 ────────────────────────────────────────────── */}
      <SearchFilters
        meta={meta}
        onSearch={ctrl.handleSearch}
        searchRef={searchRef}
        filtersRef={filtersRef}
        pageSize={model.pageSize}
        fetchFn={ctrl.fetchConfigList}
      />

      {/* ── 탭 네비게이션 ───────────────────────────────────────── */}
      <div className="flex gap-0.5 border-b border-border shrink-0 px-1">
        {model.configTabs.map((tab) => (
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

      {/* ── 2x2 그리드 레이아웃 ─────────────────────────────────── */}
      <div className="flex-1 min-h-0 min-w-0">
        <PanelGroup direction="vertical" className="h-full">
          {/* ── 상단 행 ───────────────────────────────────────── */}
          <Panel defaultSize={55} minSize={25}>
            <PanelGroup direction="horizontal" className="h-full">
              {/* Top-left: 플류운영그룹운영설정 */}
              <Panel defaultSize={50} minSize={25}>
                <DataGrid
                  layoutType="plain"
                  columnDefs={CONFIG_COLUMN_DEFS((updater: any) =>
                    model.setConfigData((prev: any) => ({
                      ...prev,
                      rows:
                        typeof updater === "function"
                          ? updater(prev.rows)
                          : updater,
                    })),
                  )}
                  rowData={model.configData.rows}
                  totalCount={model.configData.totalCount}
                  currentPage={model.configData.page}
                  pageSize={model.pageSize}
                  onPageSizeChange={model.setPageSize}
                  onPageChange={(page) => searchRef.current?.(page, false)}
                  actions={ctrl.configActions}
                  onRowClicked={ctrl.handleConfigRowClicked}
                />
              </Panel>

              <PanelResizeHandle className="w-1.5 cursor-col-resize hover:bg-slate-200/70" />

              {/* Top-right: 설정상세 */}
              <Panel defaultSize={50} minSize={25}>
                <DataGrid
                  layoutType="plain"
                  columnDefs={CONFIG_DETAIL_COLUMN_DEFS(model.setDetailData)}
                  rowData={model.detailData.rows}
                  totalCount={model.detailData.totalCount}
                  currentPage={model.detailData.page}
                  pageSize={model.pageSize}
                  onPageSizeChange={model.setPageSize}
                  onPageChange={(page) => searchRef.current?.(page, false)}
                  actions={ctrl.detailActions}
                  onRowClicked={ctrl.handleDetailRowClicked}
                />
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="h-1.5 cursor-row-resize hover:bg-slate-200/70" />

          {/* ── 하단 행 ───────────────────────────────────────── */}
          <Panel defaultSize={45} minSize={20}>
            <PanelGroup direction="horizontal" className="h-full">
              {/* Bottom-left: 설정코드다국어설정 */}
              <Panel defaultSize={50} minSize={25}>
                <DataGrid
                  layoutType="plain"
                  columnDefs={CONFIG_I18N_COLUMN_DEFS(model.setI18nData)}
                  rowData={model.i18nData}
                  actions={ctrl.i18nActions}
                  onRowClicked={ctrl.handleI18nRowClicked}
                  subTitle="설정코드다국어설정"
                />
              </Panel>

              <PanelResizeHandle className="w-1.5 cursor-col-resize hover:bg-slate-200/70" />

              {/* Bottom-right: 설정상세코드다국어설정 */}
              <Panel defaultSize={50} minSize={25}>
                <DataGrid
                  layoutType="plain"
                  columnDefs={CONFIG_DETAIL_I18N_COLUMN_DEFS(
                    model.setDetailI18nData,
                  )}
                  rowData={model.detailI18nData}
                  actions={ctrl.detailI18nActions}
                  subTitle="설정상세코드다국어설정"
                />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
