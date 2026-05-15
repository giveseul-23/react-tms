"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useCurrencyModel } from "./CurrencyModel";
import { useCurrencyController } from "./CurrencyController";
import { MAIN_COLUMN_DEFS } from "./CurrencyColumns";

export const MENU_CD = "MENU_CURR_MGMT";

export default function Currency() {
  const model = useCurrencyModel(MENU_CD);
  const ctrl = useCurrencyController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CD}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.onSearchCallback,
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
