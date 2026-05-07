"use client";

import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";

import { useOverheadTariffManagementModel } from "./OverheadTariffManagementModel";
import { useOverheadTariffManagementController } from "./OverheadTariffManagementController";
import {
  MAIN_COLUMN_DEFS,
  DETAIL_LEFT_COLUMN_DEFS,
  DETAIL_RIGHT_COLUMN_DEFS,
} from "./OverheadTariffManagementColumns";

export const MENU_CODE = "MENU_OVERHEAD_TARIFF_MGMT";

export default function OverheadTariffManagement() {
  const model = useOverheadTariffManagementModel(MENU_CODE);
  const ctrl = useOverheadTariffManagementController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[40, 60]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
        menuCode: MENU_CODE,
      }}
      direction={model.layout === "side" ? "vertical" : "horizontal"}
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
          columnDefs={MAIN_COLUMN_DEFS(model.grids.main.setData)}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          audit={false}
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
            {...model.bind("subChg")}
            columnDefs={DETAIL_LEFT_COLUMN_DEFS(model.grids.subChg.setData)}
            codeMap={model.codeMap}
            actions={ctrl.detailActions}
            onRowClicked={ctrl.onSubChgRowClicked}
            audit={false}
          />
          <DataGrid
            {...model.bind("subChgDtl")}
            columnDefs={DETAIL_RIGHT_COLUMN_DEFS(model.grids.subChgDtl.setData)}
            codeMap={model.codeMap}
            actions={ctrl.detailActions}
            audit={false}
          />
        </SplitPane>
      }
    />
  );
}
