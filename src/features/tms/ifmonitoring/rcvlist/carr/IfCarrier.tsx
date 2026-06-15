"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useIfCarrierModel } from "./IfCarrierModel";
import { useIfCarrierController } from "./IfCarrierController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
} from "./IfCarrierColumns";

export const MENU_CODE = "MENU_IF_RCV_CARR";

export default function IfCarrier() {
  const model = useIfCarrierModel(MENU_CODE);
  const ctrl = useIfCarrierController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[56, 44]}
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
          authId="MAIN_GRID_IF_RCV_CARR"
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
            { key: "BANK", label: "LBL_BANK_ACCOUNT" },
            { key: "COMPANY", label: "LBL_COMPANY" },
          ]}
          presets={{
            BANK: {
              render: () => (
                <DataGrid
                  {...model.bind("sub01")}
                  authId="SUB01_GRID_CARR"
                  columnDefs={SUB01_COLUMN_DEFS}
                  audit={false}
                />
              ),
            },
            COMPANY: {
              render: () => (
                <DataGrid
                  {...model.bind("sub02")}
                  authId="SUB02_GRID_CARR"
                  columnDefs={SUB02_COLUMN_DEFS}
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
