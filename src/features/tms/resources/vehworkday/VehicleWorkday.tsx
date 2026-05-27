"use client";

import DataGrid from "@/app/components/grid/DataGrid";

import { useVehicleWorkdayModel } from "./VehicleWorkdayModel";
import { useVehicleWorkdayController } from "./VehicleWorkdayController";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";

export const MENU_CODE = "MENU_VEH_WORKDAY_MGMT";

export default function VehicleWorkday() {
  const model = useVehicleWorkdayModel(MENU_CODE);
  const ctrl = useVehicleWorkdayController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
        menuCode: MENU_CODE,
        excludes: [
          {
            column: "DTL.WRK_DAY",
            as: { FROM: "SDATE", TO: "EDATE" },
            transform: (v) => String(v).replace(/-/g, ""),
          },
          {
            column: "WRK_DAY_TP",
            as: "WRK_DAY_TP",
          },
        ],

      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          rowSelection="multiple"
          columnDefs={model.mainColumnDefs}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          gridOptions={{
            onCellDoubleClicked: ctrl.onCellDoubleClicked
          }}
          audit={{
            delete: false,
            updatePerson: false,
            updateTime: false,
          }}
        />
      }
    />
  );
}