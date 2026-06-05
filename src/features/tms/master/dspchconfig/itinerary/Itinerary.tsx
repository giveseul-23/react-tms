"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";

import { useItineraryModel } from "./ItineraryModel";
import { useItineraryController } from "./ItineraryController";
import { MAIN_COLUMN_DEFS, SUB01_COLUMN_DEFS } from "./ItineraryColumns";

export const MENU_CODE = "MENU_ITNR_MGMT";

export default function Itinerary() {
  const model = useItineraryModel(MENU_CODE);
  const ctrl = useItineraryController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        rawFiltersRef: model.rawFiltersRef,
        pageSize: model.pageSize,
      }}
      defaultDirection="horizontal"
      defaultSizes={[60, 40]}
      layoutToggle={true}
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.onMainGridClick}
          rowSelection="multiple"
        />
      }
      detail={
        <DataGrid
          {...model.bind("sub01")}
          columnDefs={SUB01_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.sub01Actions}
          pagination={false}
        />
      }
    />
  );
}
