"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchConditionModel } from "@/features/adm/menu/srchCond/SearchConditionModel";
import { useSearchConditionController } from "@/features/adm/menu/srchCond/SearchConditionController";
import { MAIN_COLUMN_DEFS } from "@/features/adm/menu/srchCond/SearchConditionColumns";

export const MENU_CD = "MENU_CFG_SRCH_COND";

export default function SearchCondition() {
  const model = useSearchConditionModel(MENU_CD);
  const ctrl = useSearchConditionController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CD}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          layoutType="plain"
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          headerCheckbox={false}
          actions={ctrl.mainActions}
          audit={true}
        />
      }
    />
  );
}
