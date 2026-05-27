"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useCarrierModel } from "./CarrierModel";
import { useCarrierController } from "./CarrierController";
import { MAIN_COLUMN_DEFS, BANK_COLUMN_DEFS, COMP_COLUMN_DEFS } from "./CarrierColumns";

// TODO: 실제 메뉴 코드로 교체
export const MENU_CODE = "MENU_CARRIER_MGMT";

export default function Carrier() {
  const model = useCarrierModel(MENU_CODE);
  const ctrl = useCarrierController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[40, 60]}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
      }}
      defaultDirection="horizontal"
      layoutToggle={true}
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          onRowClicked={ctrl.onMainGridClick}
          audit={{ delete: false, rowStatus: false }}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "BACK", label: "LBL_BANK_ACCOUNT" },
            { key: "COMP", label: "LBL_COMPANY" },
          ]}
          presets={{
            BACK: {
              render: () => (
                <DataGrid
                  {...model.bind("bank")}
                  columnDefs={BANK_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  audit={{ delete: false, rowStatus: false }}
                />
              ),
            },
            COMP: {
              render: () => (
                <DataGrid
                  {...model.bind("comp")}
                  columnDefs={COMP_COLUMN_DEFS}
                  audit={{ delete: false, rowStatus: false }}
                />
              ),
            },
          }}
        />
      }
    />
  );
}