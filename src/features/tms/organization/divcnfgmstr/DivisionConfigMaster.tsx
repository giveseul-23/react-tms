"use client";

import { useRef, useEffect } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { SearchFilters } from "@/app/components/Search/SearchFilters";
import { SplitPane } from "@/app/components/layout/SplitPane";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useDivisionConfigMasterModel } from "./DivisionConfigMasterModel.ts";
import { useDivisionConfigMasterController } from "./DivisionConfigMasterController";
import {
  CONFIG_COLUMN_DEFS,
  CONFIG_DETAIL_COLUMN_DEFS,
  CONFIG_I18N_COLUMN_DEFS,
  CONFIG_DETAIL_I18N_COLUMN_DEFS,
} from "./DivisionConfigMasterColumns";

const MENU_CODE = "MENU_DIV_OPR_CONFIG_MST";

export default function DivisionConfigMaster() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useDivisionConfigMasterModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});

  const ctrl = useDivisionConfigMasterController({
    model,
    searchRef,
    filtersRef,
  });

  // activeTab 변경 시 4개 그리드 초기화 + 재조회
  const isTabInit = useRef(true);
  useEffect(() => {
    if (isTabInit.current) {
      isTabInit.current = false;
      return;
    }
    if (!model.activeTab) return;
    model.resetSubGrids();
    model.setConfigData({ rows: [], totalCount: 0, page: 1, limit: 20 });
    // fetchConfigList가 activeTab 변경으로 새로 생성된 후 조회
    setTimeout(() => searchRef.current?.(1), 0);
  }, [model.activeTab]);

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

      {/* ── 2x2 그리드 레이아웃 ─────────────────────────────────── */}
      <div className="flex-1 min-h-0 min-w-0">
        <SplitPane
          direction="vertical"
          defaultSizes={[55, 45]}
          minSizes={[25, 20]}
          handleThickness="1.5"
          storageKey="lgstgrp-opr-config-mst-outer"
        >
          {/* ── 상단 행 ───────────────────────────────────────── */}
          <SplitPane
            direction="horizontal"
            defaultSizes={[50, 50]}
            minSizes={[25, 25]}
            handleThickness="1.5"
            storageKey="lgstgrp-opr-config-mst-top"
          >
            {/* Top-left: 플류운영그룹운영설정 */}
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

            {/* Top-right: 설정상세 */}
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
          </SplitPane>

          {/* ── 하단 행 ───────────────────────────────────────── */}
          <SplitPane
            direction="horizontal"
            defaultSizes={[50, 50]}
            minSizes={[25, 25]}
            handleThickness="1.5"
            storageKey="lgstgrp-opr-config-mst-bottom"
          >
            {/* Bottom-left: 설정코드다국어설정 */}
            <DataGrid
              layoutType="plain"
              columnDefs={CONFIG_I18N_COLUMN_DEFS(model.setI18nData)}
              rowData={model.i18nData}
              actions={ctrl.i18nActions}
              onRowClicked={ctrl.handleI18nRowClicked}
              subTitle="설정코드다국어설정"
            />

            {/* Bottom-right: 설정상세코드다국어설정 */}
            <DataGrid
              layoutType="plain"
              columnDefs={CONFIG_DETAIL_I18N_COLUMN_DEFS(
                model.setDetailI18nData,
              )}
              rowData={model.detailI18nData}
              actions={ctrl.detailI18nActions}
              subTitle="설정상세코드다국어설정"
            />
          </SplitPane>
        </SplitPane>
      </div>
    </div>
  );
}
