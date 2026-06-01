"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { useItineraryGroupModel } from "./ItineraryGroupModel";
import { useItineraryGroupController } from "./ItineraryGroupController";
import { MAIN_COLUMN_DEFS } from "./ItineraryGroupColumns";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import { useRef } from "react";

export const MENU_CODE = "MENU_ITNR_GRP_MGMT";

export default function ItineraryGroup() {
  const model = useItineraryGroupModel(MENU_CODE);
  const rawFiltersRef = useRef<Record<string, string>>({});
  const ctrl = useItineraryGroupController({ model, rawFiltersRef });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
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
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
        />
      }
    />
  );
}