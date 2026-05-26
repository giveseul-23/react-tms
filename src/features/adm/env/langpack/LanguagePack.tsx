"use client";

import { useMemo } from "react";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useLanguagePackModel } from "./LanguagePackModel";
import { useLanguagePackController } from "./LanguagePackController";
import { MAIN_COLUMN_DEFS } from "./LanguagePackColumns";

export const MENU_CD = "MENU_LANG_PACK";

export default function LanguagePack() {
  const model = useLanguagePackModel(MENU_CD);
  const columnDefs = useMemo(
    () => MAIN_COLUMN_DEFS(model.grids.main.setData),
    [model.grids.main.setData],
  );

  const ctrl = useLanguagePackController({
    menuCd: MENU_CD,
    model,
  });

  return (
    <GridOnlyPage
      menuCode={MENU_CD}
      searchProps={{
        fetchFn: ctrl.fetchLanguagePackList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          layoutType="plain"
          columnDefs={columnDefs}
          codeMap={model.codeMap}
          headerCheckbox={false}
          actions={ctrl.mainActions}
        />
      }
    />
  );
}
