"use client";

import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";

import { useLogisticGroupDefaultModel } from "./LogisticGroupDefaultModel";
import { useLogisticGroupDefaultController } from "./LogisticGroupDefaultController";
import {
  CNFG_HEADER_COLUMN_DEFS,
  CNFG_DETAIL_COLUMN_DEFS,
  DETAIL_COLUMN_DEFS,
} from "./LogisticGroupDefaultColumns";

export const MENU_CODE = "MENU_ORGANIZATION_ENV_LGST_GRP_DFT";

export default function LogisticGroupDefault() {
  const model = useLogisticGroupDefaultModel(MENU_CODE);
  const ctrl = useLogisticGroupDefaultController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[20, 80]}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      defaultDirection={"horizontal"}
      storageKey={model.storageKeys.outer}
      master={
        <SplitPane
          direction="horizontal"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey={model.storageKeys.top}
        >
          <DataGrid
            {...model.bind("header")}
            columnDefs={CNFG_HEADER_COLUMN_DEFS}
            onRowClicked={ctrl.onHeaderGridClick}
            actions={ctrl.headerActions}
            audit={false}
          />
          <DataGrid
            {...model.bind("subCnfg")}
            columnDefs={CNFG_DETAIL_COLUMN_DEFS}
            actions={ctrl.subCnfgActions}
            onRowClicked={ctrl.onSubCnfgGridClick}
            audit={false}
          />
        </SplitPane>
      }
      detail={
        <DataGrid
          {...model.bind("detail")}
          columnDefs={DETAIL_COLUMN_DEFS}
          actions={ctrl.detailActions}
          codeMap={model.codeMap}
          headerCheckbox={false}
        />
      }
    />
  );
}
