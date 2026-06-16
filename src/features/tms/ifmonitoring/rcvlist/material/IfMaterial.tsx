"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useIfMaterialModel } from "./IfMaterialModel";
import { useIfMaterialController } from "./IfMaterialController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
  SUB03_COLUMN_DEFS,
} from "./IfMaterialColumns";

export const MENU_CODE = "MENU_IF_RCV_MATERIAL";

export default function IfMaterial() {
  const model = useIfMaterialModel(MENU_CODE);
  const ctrl = useIfMaterialController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[60, 40]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      defaultDirection="vertical"
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          rowSelection="multiple"
          authId="MAIN_GRID_IF_RCV_DLVRY_DEST"
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "PLANT", label: "LBL_PLANT" },
            { key: "SALES", label: "LBL_SALES" },
            { key: "UOM", label: "LBL_UOM" },
          ]}
          presets={{
            PLANT: {
              render: () => (
                <DataGrid
                  {...model.bind("sub01")}
                  authId="SUB01_GRID_IFMATERIAL"
                  columnDefs={SUB01_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  audit={false}
                />
              ),
            },
            SALES: {
              render: () => (
                <DataGrid
                  {...model.bind("sub02")}
                  authId="SUB02_GRID_IFMATERIAL"
                  columnDefs={SUB02_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  audit={false}
                />
              ),
            },
            UOM: {
              render: () => (
                <DataGrid
                  {...model.bind("sub03")}
                  authId="SUB03_GRID_IFMATERIAL"
                  columnDefs={SUB03_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  audit={false}
                />
              ),
            },
          }}
          actions={[]}
        />
      }
    />
  );
}
