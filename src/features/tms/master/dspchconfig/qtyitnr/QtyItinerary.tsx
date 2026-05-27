"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";

import { useQtyItineraryModel } from "./QtyItineraryModel";
import { useQtyItineraryController } from "./QtyItineraryController";
import { MAIN_COLUMN_DEFS } from "./QtyItineraryColumns";

export const MENU_CODE = "MENU_QTY_ITNR";

export default function QtyItinerary() {
  const model = useQtyItineraryModel(MENU_CODE);
  const ctrl = useQtyItineraryController({ model });

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
