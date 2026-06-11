"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";

import { useLeadDeliveryTimeManagementModel } from "./LeadDeliveryTimeManagementModel";
import { useLeadDeliveryTimeManagementController } from "./LeadDeliveryTimeManagementController";
import { MAIN_COLUMN_DEFS } from "./LeadDeliveryTimeManagementColumns";

export const MENU_CODE = "MENU_LDTM_MGMT";

export default function LeadDeliveryTimeManagement() {
  const model = useLeadDeliveryTimeManagementModel(MENU_CODE);
  const ctrl = useLeadDeliveryTimeManagementController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          actions={ctrl.mainActions}
        />
      }
    />
  );
}
