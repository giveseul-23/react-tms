"use client";

import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";

import { useIndstrlAccdntCmpnstnModel } from "./IndstrlAccdntCmpnstnModel";
import { useIndstrlAccdntCmpnstnController } from "./IndstrlAccdntCmpnstnController";
import {
  MAIN_COLUMN_DEFS,
  DETAIL01_COLUMN_DEFS,
  DETAIL02_COLUMN_DEFS,
} from "./IndstrlAccdntCmpnstnColumns";

export const MENU_CODE = "MENU_IACI_MGMT";

export default function IndstrlAccdntCmpnstn() {
  const model = useIndstrlAccdntCmpnstnModel(MENU_CODE);
  const ctrl = useIndstrlAccdntCmpnstnController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[30, 70]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
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
          columnDefs={MAIN_COLUMN_DEFS}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
      detail={
        <SplitPane
          direction="vertical"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey={model.storageKeys.bottom}
        >
          <DataGrid
            {...model.bind("rate")}
            columnDefs={DETAIL01_COLUMN_DEFS()}
            codeMap={model.codeMap}
            actions={ctrl.detailActions}
            onRowClicked={ctrl.onRateRowClicked}
          />
          <DataGrid
            {...model.bind("chg")}
            columnDefs={DETAIL02_COLUMN_DEFS()}
            codeMap={model.codeMap}
            actions={ctrl.detailActions}
          />
        </SplitPane>
      }
    />
  );
}
