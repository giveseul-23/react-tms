"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useFeatureModel } from "./IfPlantModel";
import { useFeatureController } from "./IfPlantController";
import { MAIN_COLUMN_DEFS } from "./IfPlantColumns";

export const MENU_CODE = "MENU_IF_RCV_PLANT";

export default function IfPlant() {
  const model = useFeatureModel(MENU_CODE);
  const ctrl = useFeatureController({ model });

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
          rowSelection="multiple"
          authId="MAIN_GRID_IF_RCV_PLANT"
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
    />
  );
}
