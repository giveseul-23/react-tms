"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useParameterConfigurationModel } from "./ParameterConfigurationModel";
import { useParameterConfigurationController } from "./ParameterConfigurationController";
import { MAIN_COLUMN_DEFS } from "./ParameterConfigurationColumns";

export const MENU_CD = "MENU_PARAM_CNFG";

export default function ParameterConfiguration() {
  const model = useParameterConfigurationModel(MENU_CD);
  const ctrl = useParameterConfigurationController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CD}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          audit={{ delete: false }}
        />
      }
    />
  );
}
