"use client";

import { useMemo } from "react";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useAccessHistModel } from "./AccessHistModel";
import { useAccessHistController } from "./AccessHistController";
import { MAIN_COLUMN_DEFS } from "./AccessHistColumns";

export const MENU_CD = "MENU_ACCESS_HIST";
export default function AccessHist() {
  const model = useAccessHistModel(MENU_CD);
  const columnDefs = useMemo(
    () => MAIN_COLUMN_DEFS(model.grids.main.setData),
    [model.grids.main.setData],
  );

  const ctrl = useAccessHistController({
    menuCd: MENU_CD,
    model,
  });

  return (
    <GridOnlyPage
      menuCode={MENU_CD}
      searchProps={{
        moduleDefault: "TMS",
        menuCode: MENU_CD,
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.handleSearch,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          layoutType="plain"
          columnDefs={columnDefs}
          audit={{ updatePerson: false, updateTime: false }}
        />
      }
    />
  );
}
