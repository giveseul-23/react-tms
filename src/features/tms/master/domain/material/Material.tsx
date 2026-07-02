"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useMaterialModel } from "./MaterialModel";
import { useMaterialController } from "./MaterialController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
} from "./MaterialColumns";

export const MENU_CD = "MENU_MATERIAL_MGMT";

export default function Material() {
  const model = useMaterialModel(MENU_CD);
  const ctrl = useMaterialController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CD}
      defaultSizes={[50, 50]}
      searchProps={{
        moduleDefault: "TMS",
        menuCode: MENU_CD,
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.handleSearch,
        ...model.bindSearch(),
      }}
      defaultDirection="vertical"
      layoutToggle={true}
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          audit={{ delete: false, rowStatus: false }}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "CONVERSION_QTY", label: "LBL_CONVERSION_QTY" },
            { key: "LOC_SALES", label: "LBL_LOC_SALES" },
          ]}
          presets={{
            CONVERSION_QTY: {
              render: () => (
                <DataGrid
                  {...model.bind("sub02")}
                  layoutType="plain"
                  audit={{ delete: false, rowStatus: false }}
                  columnDefs={SUB02_COLUMN_DEFS}
                  actions={ctrl.sub02Actions}
                />
              ),
            },
            LOC_SALES: {
              render: () => (
                <DataGrid
                  {...model.bind("sub01")}
                  layoutType="plain"
                  audit={{ delete: false, rowStatus: false }}
                  columnDefs={SUB01_COLUMN_DEFS}
                  actions={ctrl.sub01Actions}
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
