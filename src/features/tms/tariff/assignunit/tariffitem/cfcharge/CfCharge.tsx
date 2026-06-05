"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { useCfChargeModel } from "./CfChargeModel";
import { useCfChargeController } from "./CfChargeController";
import { MAIN_COLUMN_DEFS } from "./CfChargeColumns";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import { useRef } from "react";

export const MENU_CODE = "MENU_DSPTCH_BS_GHRG_MGMT";

export default function CfCharge() {
  const model = useCfChargeModel(MENU_CODE);
  const rawFiltersRef = useRef<Record<string, string>>({});
  const ctrl = useCfChargeController({ model, rawFiltersRef });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        rawFiltersRef,
        pageSize: model.pageSize,
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