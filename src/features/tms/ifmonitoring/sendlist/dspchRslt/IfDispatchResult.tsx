"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useIfDispatchResultModel } from "./IfDispatchResultModel";
import { useIfDispatchResultController } from "./IfDispatchResultController";
import { MAIN_COLUMN_DEFS } from "./IfDispatchResultColumns";

export const MENU_CODE = "MENU_IF_SEND_DSPCH_RSLT";

export default function IfDispatchResult() {
  const model = useIfDispatchResultModel(MENU_CODE);
  const ctrl = useIfDispatchResultController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
        userTz: "Asia/Seoul",
        menuCode: MENU_CODE,
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
    />
  );
}
