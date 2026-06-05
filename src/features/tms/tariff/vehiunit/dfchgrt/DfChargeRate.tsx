"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
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
        ...model.bindSearch(),
      }}
      defaultDirection={"horizontal"}
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
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
              { key: "RT_ITM", label: "LBL_RATE_ITEM" },
              { key: "RT_CARR", label: "LBL_CARRIER" },
              { key: "RT_VEH_TP", label: "LBL_VEHICLE_TYPE" },
            ]}
            presets={{
              RT_ITM: {
                render: () => (
                  <DataGrid
                    {...model.bind("rtItem")}
                    columnDefs={RT_ITM_COLUMN_DEFS}
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
                    columnDefs={RT_CARR_COLUMN_DEFS}
                    actions={ctrl.detailActions}
                    audit={{ updatePerson: false, updateTime: false }}
                  />
                ),
              },
              RT_VEH_TP: {
                render: () => (
                  <DataGrid
                    {...model.bind("rtVehTp")}
                    columnDefs={RT_VEH_TP_COLUMN_DEFS}
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
              { key: "RT_ITM_VEH_TP", label: "LBL_RATE_BY_VEH_TP" },
              { key: "RT_ITM_VEH", label: "LBL_RATE_BY_VEH" },
            ]}
            presets={{
              RT_ITM_VEH_TP: {
                render: () => (
                  <DataGrid
                    {...model.bind("rtItemVehTp")}
                    columnDefs={RT_ITM_VEH_TP_COLUMN_DEFS}
                    actions={ctrl.detailActions}
                  />
                ),
              },
              RT_ITM_VEH: {
                render: () => (
                  <DataGrid
                    {...model.bind("rtItemVeh")}
                    columnDefs={RT_ITM_VEH_COLUMN_DEFS}
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
