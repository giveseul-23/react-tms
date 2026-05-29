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
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
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
          {/* 디비전운영설정코드 */}
          <DataGrid
            {...model.bind("divCd")}
            columnDefs={CONFIG_COLUMN_DEFS}
            onRowClicked={ctrl.onMainGridClick}
            actions={ctrl.mainActions}
            codeMap={model.codeMap}
          />
          {/* 디비전운영설정코드 다국어설정 */}
          <DataGrid
            {...model.bind("divCd18n")}
            columnDefs={CONFIG_I18N_COLUMN_DEFS}
            subTitle="LBL_CNFG_CD_LANG_SETTING"
            actions={ctrl.divCd18nActions}
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
          {/* 디비전운영정책상세코드 */}
          <DataGrid
            {...model.bind("divDtlCd")}
            columnDefs={CONFIG_DETAIL_COLUMN_DEFS}
            actions={ctrl.divDtlCdActions}
            onRowClicked={ctrl.ondivDtlCdGridClick}
          />
          {/* 디비전운영정책상세코드 다국어 */}
          <DataGrid
            {...model.bind("divDtlCd18n")}
            columnDefs={CONFIG_DETAIL_I18N_COLUMN_DEFS}
            subTitle="LBL_CNFG_DTL_CD_LANG_SETTING"
            actions={ctrl.divDtlCd18nActions}
            codeMap={model.codeMap}
          />
        </SplitPane>
      }
    />
  );
}
