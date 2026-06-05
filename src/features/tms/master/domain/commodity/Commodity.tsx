"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useCommodityModel } from "@/features/tms/master/domain/commodity/CommodityModel";
import { useCommodityController } from "@/features/tms/master/domain/commodity/CommodityController";
import { MAIN_COLUMN_DEFS } from "@/features/tms/master/domain/commodity/CommodityColumns";

export const MENU_CD = "MENU_CMDT_MGMT";

export default function Commodity() {
  const model = useCommodityModel(MENU_CD);
  const ctrl = useCommodityController({ model });

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
          columnDefs={MAIN_COLUMN_DEFS}
          actions={ctrl.mainActions}
        />
      }
    />
  );
}
