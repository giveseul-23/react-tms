"use client";

import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";

import { useRateModel } from "./RateModel";
import { useRateController } from "./RateController";
import {
  MAIN_COLUMN_DEFS,
  DETAIL01_COLUMN_DEFS,
  DETAIL02_COLUMN_DEFS,
} from "./RateColumns";

export const MENU_CODE = "MENU_DSPTCH_RATE";

export default function Rate() {
  const model = useRateModel(MENU_CODE);
  const ctrl = useRateController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[40, 60]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.onSearchCallback,
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
          columnDefs={MAIN_COLUMN_DEFS()}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
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
            {...model.bind("costInfo")}
            columnDefs={DETAIL01_COLUMN_DEFS(model.codeMap)}
            actions={ctrl.detailActions}
            onRowClicked={ctrl.onCostInfoRowClicked}
          />
          <DataGrid
            {...model.bind("conditionInfo")}
            columnDefs={DETAIL02_COLUMN_DEFS(model.codeMap)}
            actions={ctrl.detailActions}
          />
        </SplitPane>
      }
    />
  );
}
