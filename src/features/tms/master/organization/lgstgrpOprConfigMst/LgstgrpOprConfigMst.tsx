// src/features/tms/master/organization/lgstgrpOprConfigMst/LgstgrpOprConfigMst.tsx
"use client";

import { useRef, useEffect } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useLgstgrpOprConfigMstModel } from "./LgstgrpOprConfigMstModel.ts";
import { useLgstgrpOprConfigMstController } from "./LgstgrpOprConfigMstController.tsx";
import {
  CONFIG_COLUMN_DEFS,
  CONFIG_DETAIL_COLUMN_DEFS,
  CONFIG_I18N_COLUMN_DEFS,
  CONFIG_DETAIL_I18N_COLUMN_DEFS,
} from "./LgstgrpOprConfigMstColumns.tsx";
export const MENU_CODE = "MENU_LGSTGRP_OPR_CONFIG_MST";

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
    setTimeout(() => searchRef.current?.(1), 0);
  }, [model.activeTab]);

  if (loading) return <Skeleton className="h-24" />;

  // ── 페이지 외부 탭 네비게이션 ────────────────────────────────
  const tabNav = (
    <div className="flex gap-0.5 border-b border-border px-1">
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
  );

  return (
    <MasterDetailPage
      searchProps={{
        meta,
        fetchFn: ctrl.fetchConfigList,
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
            onPageChange={(page) => searchRef.current?.(page)}
            actions={ctrl.configActions}
            onRowClicked={ctrl.handleConfigRowClicked}
            rowSelection="single"
            autoSelectFirstRow
            rowKeys="CNFG_CD"
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
            onPageChange={(page) => searchRef.current?.(page)}
            actions={ctrl.detailActions}
            onRowClicked={ctrl.handleDetailRowClicked}
            rowSelection="single"
            autoSelectFirstRow
            rowKeys={["CNFG_CD", "CNFG_DTL_CD"]}
          />
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
          {/* Bottom-left: 설정코드다국어설정 */}
          <DataGrid
            layoutType="plain"
            columnDefs={CONFIG_I18N_COLUMN_DEFS(model.setI18nData)}
            rowData={model.i18nData}
            actions={ctrl.i18nActions}
            onRowClicked={ctrl.handleI18nRowClicked}
            rowSelection="single"
            subTitle="LBL_CNFG_CD_LANG_SETTING"
            autoSelectFirstRow
            rowKeys={["CNFG_CD", "CNFG_DTL_CD", "LANG_TP"]}
          />

          {/* Bottom-right: 설정상세코드다국어설정 */}
          <DataGrid
            layoutType="plain"
            columnDefs={CONFIG_DETAIL_I18N_COLUMN_DEFS(
              model.setDetailI18nData,
            )}
            rowData={model.detailI18nData}
            actions={ctrl.detailI18nActions}
            rowSelection="single"
            subTitle="LBL_CNFG_DTL_CD_LANG_SETTING"
          />
        </SplitPane>
      }
    />
  );
}
