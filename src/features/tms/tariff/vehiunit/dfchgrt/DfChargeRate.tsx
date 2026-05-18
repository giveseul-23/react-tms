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
          columnDefs={MAIN_COLUMN_DEFS()}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
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
                render: () => (
                  <DataGrid
                    {...model.bind("rtItem")}
                    columnDefs={RT_ITM_COLUMN_DEFS([])}
                    actions={ctrl.detailActions}
                    onRowClicked={ctrl.onRtItemRowClicked}
                    audit={{ updatePerson: false, updateTime: false }}
                  />
                ),
              },
              RT_CARR: {
                render: () => (
                  <DataGrid
                    {...model.bind("rtCarr")}
                    columnDefs={RT_CARR_COLUMN_DEFS([])}
                    actions={ctrl.detailActions}
                    audit={{ updatePerson: false, updateTime: false }}
                  />
                ),
              },
              RT_VEH_TP: {
                render: () => (
                  <DataGrid
                    {...model.bind("rtVehTp")}
                    columnDefs={RT_VEH_TP_COLUMN_DEFS([])}
                    actions={ctrl.detailActions}
                    audit={{ updatePerson: false, updateTime: false }}
                  />
                ),
              },
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
                render: () => (
                  <DataGrid
                    {...model.bind("rtItemVehTp")}
                    columnDefs={RT_ITM_VEH_TP_COLUMN_DEFS([])}
                    actions={ctrl.detailActions}
                  />
                ),
              },
              RT_ITM_VEH: {
                render: () => (
                  <DataGrid
                    {...model.bind("rtItemVeh")}
                    columnDefs={RT_ITM_VEH_COLUMN_DEFS([])}
                    actions={ctrl.detailActions}
                  />
                ),
              },
            }}
            actions={[]}
          />
        </SplitPane>
      }
    />
  );
}
