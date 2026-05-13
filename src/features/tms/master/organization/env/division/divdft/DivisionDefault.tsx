"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDivisionDefaultModel } from "./DivisionDefaultModel";
import { useDivisionDefaultController } from "./DivisionDefaultController";
import { MAIN_COLUMN_DEFS, DETAIL_COLUMN_DEFS } from "./DivisionDefaultColumns";

export const MENU_CODE = "MENU_ORGANIZATION_ENV_DIV_DFT";

export default function DivisionDefault() {
  const model = useDivisionDefaultModel(MENU_CODE);
  const ctrl = useDivisionDefaultController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[10, 90]}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
      }}
      defaultDirection="horizontal"
      layoutToggle={true}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          onRowClicked={ctrl.onMainGridClick}
          rowKeys={"CNFG_CD"}
          autoSelectFirstRow
          audit={false}
          pagination={false}
        />
      }
      detail={
        <DataGrid
          {...model.bind("detail")}
          columnDefs={DETAIL_COLUMN_DEFS}
          rowKeys={["CNFG_CD", "CNFG_DTL_CD"]}
          actions={ctrl.detailActions}
          codeMap={model.codeMap}
        />
      }
    />
  );
}
