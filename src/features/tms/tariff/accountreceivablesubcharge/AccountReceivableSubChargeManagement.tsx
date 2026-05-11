"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";

import { useAccountReceivableSubChargeManagementModel } from "./AccountReceivableSubChargeManagementModel";
import { useAccountReceivableSubChargeManagementController } from "./AccountReceivableSubChargeManagementController";
import {
  MAIN_COLUMN_DEFS,
  DETAIL01_COLUMN_DEFS,
  DETAIL02_COLUMN_DEFS,
} from "./AccountReceivableSubChargeManagementColumns";

export const MENU_CODE =
  "MENU_ACCOUNT_RECEIVABLE_CONTRACT_SUB_CHARGE_MANAGEMENT";

export default function AccountReceivableSubChargeManagement() {
  const model = useAccountReceivableSubChargeManagementModel(MENU_CODE);
  const ctrl = useAccountReceivableSubChargeManagementController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[50, 60]}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
        menuCode: MENU_CODE,
      }}
      direction={model.layout === "side" ? "horizontal" : "vertical"}
      layoutToggle={{
        layout: model.layout,
        onToggle: () =>
          model.setLayout((prev: LayoutType) =>
            prev === "side" ? "vertical" : "side",
          ),
      }}
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS()}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          audit={{
            insertPerson: false,
            insertDate: false,
            updatePerson: false,
            updateTime: false,
          }}
        />
      }
      detail={
        <SplitPane
          direction="horizontal"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey={model.storageKeys.bottom}
        >
          <DataGrid
            {...model.bind("detail01")}
            columnDefs={DETAIL01_COLUMN_DEFS(model.codeMap)}
            actions={ctrl.detailActions}
            onRowClicked={ctrl.onDetail01RowClicked}
            audit={{
              rowStatus: false,
              insertPerson: false,
              insertDate: false,
              updatePerson: false,
              updateTime: false,
            }}
          />
          <DataGrid
            {...model.bind("detail02")}
            columnDefs={DETAIL02_COLUMN_DEFS(model.codeMap)}
            actions={ctrl.detailActions}
            audit={{
              rowStatus: false,
              insertPerson: false,
              insertDate: false,
              updatePerson: false,
              updateTime: false,
            }}
          />
        </SplitPane>
      }
    />
  );
}
