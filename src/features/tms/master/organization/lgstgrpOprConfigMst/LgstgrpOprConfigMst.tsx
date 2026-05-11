// src/features/tms/master/organization/lgstgrpOprConfigMst/LgstgrpOprConfigMst.tsx
"use client";

import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useLgstgrpOprConfigMstModel } from "./LgstgrpOprConfigMstModel";
import { useLgstgrpOprConfigMstController } from "./LgstgrpOprConfigMstController";
import {
  CONFIG_COLUMN_DEFS,
  CONFIG_DETAIL_COLUMN_DEFS,
  CONFIG_I18N_COLUMN_DEFS,
  CONFIG_DETAIL_I18N_COLUMN_DEFS,
} from "./LgstgrpOprConfigMstColumns";

export const MENU_CODE = "MENU_LGSTGRP_OPR_CONFIG_MST";

export default function LgstgrpOprConfigMst() {
  const model = useLgstgrpOprConfigMstModel(MENU_CODE);
  const ctrl = useLgstgrpOprConfigMstController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
      }}
      outerTabs={{
        tabs: model.configTabs,
        activeTab: model.activeType,
        onChange: ctrl.onTabChange,
      }}
      defaultDirection="horizontal"
      defaultSizes={[55, 45]}
      storageKey={model.storageKeys.outer}
      master={
        <SplitPane
          direction="vertical"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey={model.storageKeys.top}
        >
          {/* 메인 그리드 (top-left) */}
          <DataGrid
            {...model.bind("main")}
            columnDefs={CONFIG_COLUMN_DEFS}
            onRowClicked={ctrl.onMainGridClick}
            rowKeys="CNFG_CD"
            autoSelectFirstRow
            actions={ctrl.mainActions}
          />
          {/* 메인-다국어 (bottom-left) — 메인 행에 종속 */}
          <DataGrid
            {...model.bind("mainLang")}
            columnDefs={CONFIG_I18N_COLUMN_DEFS}
            subTitle="LBL_CNFG_CD_LANG_SETTING"
            actions={ctrl.sub03Actions}
            codeMap={model.codeMap}
          />
        </SplitPane>
      }
      detail={
        <SplitPane
          direction="vertical"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey={model.storageKeys.bottom}
        >
          {/* 상세 그리드 (top-right) */}
          <DataGrid
            {...model.bind("detail")}
            columnDefs={CONFIG_DETAIL_COLUMN_DEFS}
            onRowClicked={ctrl.onSub01GridClick}
            rowKeys={["CNFG_CD", "CNFG_DTL_CD"]}
            autoSelectFirstRow
            actions={ctrl.sub01Actions}
            codeMap={model.codeMap}
          />
          {/* 상세-다국어 (bottom-right) — 상세 행에 종속 */}
          <DataGrid
            {...model.bind("detailLang")}
            columnDefs={CONFIG_DETAIL_I18N_COLUMN_DEFS}
            subTitle="LBL_CNFG_DTL_CD_LANG_SETTING"
            actions={ctrl.sub02Actions}
            codeMap={model.codeMap}
          />
        </SplitPane>
      }
    />
  );
}
