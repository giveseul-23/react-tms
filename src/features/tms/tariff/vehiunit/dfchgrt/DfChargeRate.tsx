"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDfChargeRateModel } from "./DfChargeRateModel";
import { useDfChargeRateController } from "./DfChargeRateController";
import {
  MAIN_COLUMN_DEFS,
  RT_ITM_COLUMN_DEFS,
  RT_CARR_COLUMN_DEFS,
  RT_VEH_TP_COLUMN_DEFS,
  RT_ITM_VEH_TP_COLUMN_DEFS,
  RT_ITM_VEH_COLUMN_DEFS,
} from "./DfChargeRateColumns";

export const MENU_CODE = "MENU_DF_RATE_MGMT";

export default function DfChargeRate() {
  const model = useDfChargeRateModel(MENU_CODE);
  const ctrl = useDfChargeRateController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[40, 60]}
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
          columnDefs={MAIN_COLUMN_DEFS(model.grids.main.setData)}
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
            layoutType="tab"
            tabs={[
              { key: "RT_ITM", label: "계약항목" },
              { key: "RT_CARR", label: "운송협력사" },
              { key: "RT_VEH_TP", label: "차량유형" },
            ]}
            presets={{
              RT_ITM: {
                columnDefs: RT_ITM_COLUMN_DEFS([], model.grids.rtItem.setData),
                actions: ctrl.detailActions,
                onRowClicked: ctrl.onRtItemRowClicked,
              },
              RT_CARR: {
                columnDefs: RT_CARR_COLUMN_DEFS([], model.grids.rtCarr.setData),
                actions: ctrl.detailActions,
              },
              RT_VEH_TP: {
                columnDefs: RT_VEH_TP_COLUMN_DEFS(
                  [],
                  model.grids.rtVehTp.setData,
                ),
                actions: ctrl.detailActions,
              },
            }}
            rowData={{
              RT_ITM: model.grids.rtItem.rows,
              RT_CARR: model.grids.rtCarr.rows,
              RT_VEH_TP: model.grids.rtVehTp.rows,
            }}
            actions={[]}
          />
          <DataGrid
            layoutType="tab"
            tabs={[
              { key: "RT_ITM_VEH_TP", label: "차량유형별금액" },
              { key: "RT_ITM_VEH", label: "차량별금액" },
            ]}
            presets={{
              RT_ITM_VEH_TP: {
                columnDefs: RT_ITM_VEH_TP_COLUMN_DEFS(
                  [],
                  model.grids.rtItemVehTp.setData,
                ),
                actions: ctrl.detailActions,
              },
              RT_ITM_VEH: {
                columnDefs: RT_ITM_VEH_COLUMN_DEFS(
                  [],
                  model.grids.rtItemVeh.setData,
                ),
                actions: ctrl.detailActions,
              },
            }}
            rowData={{
              RT_ITM_VEH_TP: model.grids.rtItemVehTp.rows,
              RT_ITM_VEH: model.grids.rtItemVeh.rows,
            }}
            actions={[]}
          />
        </SplitPane>
      }
    />
  );
}
