"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useOrganizationModel } from "./OrganizationModel";
import { useOrganizationController } from "./OrganizationController";
import { MAIN_COLUMN_DEFS, SUB01_COLUMN_DEFS } from "./OrganizationColumns";

export const MENU_CD = "MENU_ORGANIZATION_STRUCT";
export default function Organization() {
  const model = useOrganizationModel(MENU_CD);
  const ctrl = useOrganizationController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CD}
      defaultSizes={[50, 50]}
      storageKey={model.storageKeys.outer}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      defaultDirection="vertical"
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          headerCheckbox={false}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <DataGrid
          {...model.bind("sub01")}
          columnDefs={SUB01_COLUMN_DEFS}
          headerCheckbox={false}
          actions={ctrl.sub01Actions}
          pagination={true}
        />
      }
    />
  );
}
