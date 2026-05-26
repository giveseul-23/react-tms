"use client";

import { useMemo } from "react";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useMobileAppVersionControlModel } from "./MobileAppVersionControlModel";
import { useMobileAppVersionControlController } from "./MobileAppVersionControlController";
import { MAIN_COLUMN_DEFS } from "./MobileAppVersionControlColumns";

export const MENU_CD = "MENU_APPL";

export default function MobileAppVersionControl() {
  const model = useMobileAppVersionControlModel(MENU_CD);
  const ctrl = useMobileAppVersionControlController({
    menuCd: MENU_CD,
    model,
  });
  const columnDefs = useMemo(
    () =>
      MAIN_COLUMN_DEFS(
        model.grids.main.setData,
        ctrl.handleOpenUploadPopup,
      ),
    [ctrl.handleOpenUploadPopup, model.grids.main.setData],
  );

  return (
    <GridOnlyPage
      menuCode={MENU_CD}
      searchProps={{
        fetchFn: ctrl.fetchMobileAppVersionControlList,
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
          actions={ctrl.mainActions}
        />
      }
    />
  );
}
