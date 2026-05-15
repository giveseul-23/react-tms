// src/features/tms/master/organization/divcnfgmstr/DivisionConfigMaster.tsx
"use client";

import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDivisionConfigMasterModel } from "./DivisionConfigMasterModel";
import { useDivisionConfigMasterController } from "./DivisionConfigMasterController";
import {
  CONFIG_COLUMN_DEFS,
  CONFIG_DETAIL_COLUMN_DEFS,
  CONFIG_I18N_COLUMN_DEFS,
  CONFIG_DETAIL_I18N_COLUMN_DEFS,
} from "./DivisionConfigMasterColumns";

export const MENU_CODE = "MENU_DIV_OPR_CONFIG_MST";

export default function DivisionConfigMaster() {
  const model = useDivisionConfigMasterModel(MENU_CODE);
  const ctrl = useDivisionConfigMasterController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
      }}
      direction="vertical"
      defaultSizes={[55, 45]}
      storageKey={model.storageKeys.outer}
      master={
        <SplitPane
          direction="horizontal"
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
            actions={ctrl.mainActions}
          />
          {/* 상세 그리드 (top-right) */}
          <DataGrid
            {...model.bind("sub01")}
            columnDefs={CONFIG_DETAIL_COLUMN_DEFS}
            onRowClicked={ctrl.onSub01GridClick}
            actions={ctrl.sub01Actions}
          />
        </SplitPane>
      }
      detail={
        <SplitPane
          direction="horizontal"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey={model.storageKeys.bottom}
        >
          {/* detail-i18n (bottom-left) — 상세 행에 종속 */}
          <DataGrid
            {...model.bind("sub02")}
            columnDefs={CONFIG_I18N_COLUMN_DEFS}
            subTitle="LBL_CNFG_CD_LANG_SETTING"
            actions={ctrl.sub02Actions}
          />
          {/* 메인-i18n (bottom-right) — 메인 행에 종속 */}
          <DataGrid
            {...model.bind("sub03")}
            columnDefs={CONFIG_DETAIL_I18N_COLUMN_DEFS}
            subTitle="LBL_CNFG_DTL_CD_LANG_SETTING"
            actions={ctrl.sub03Actions}
          />
        </SplitPane>
      }
    />
  );
}
