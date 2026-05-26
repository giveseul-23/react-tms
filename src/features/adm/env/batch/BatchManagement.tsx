"use client";

import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useBatchManagementModel } from "./BatchManagementModel";
import { useBatchManagementController } from "./BatchManagementController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
} from "./BatchManagementColumns";

export const MENU_CD = "MENU_BACH_MGMT";

const MAIN_AUDIT = {
  delete: true,
  rowStatus: true,
  insertPerson: false,
  insertDate: false,
  updatePerson: false,
  updateTime: false,
};

export default function BatchManagement() {
  const model = useBatchManagementModel(MENU_CD);
  const ctrl = useBatchManagementController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CD}
      defaultSizes={[65, 35]}
      storageKey={model.storageKeys.outer}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
        menuCode: MENU_CD,
      }}
      master={
        <SplitPane
          direction="vertical"
          defaultSizes={[55, 45]}
          storageKey={model.storageKeys.top}
        >
          <DataGrid
            {...model.bind("main")}
            columnDefs={MAIN_COLUMN_DEFS}
            codeMap={model.codeMap}
            headerCheckbox={false}
            audit={MAIN_AUDIT}
            onRowClicked={ctrl.onMainGridClick}
            actions={ctrl.mainActions}
          />
          <DataGrid
            {...model.bind("sub01")}
            columnDefs={SUB01_COLUMN_DEFS}
            codeMap={model.codeMap}
            headerCheckbox={false}
            audit={MAIN_AUDIT}
            onRowClicked={ctrl.onSub01GridClick}
            actions={ctrl.sub01Actions}
            pagination={false}
          />
        </SplitPane>
      }
      detail={
        <DataGrid
          {...model.bind("sub02")}
          columnDefs={SUB02_COLUMN_DEFS}
          headerCheckbox={false}
          audit={false}
          actions={[]}
          onRowDoubleClicked={ctrl.onSubGrid02DoubleClick}
          pagination={true}
        />
      }
    />
  );
}
