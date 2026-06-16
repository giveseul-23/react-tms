"use client";

// 고객사(계약) 관리 — 서버 vc.view.mdl.tms.master.account.contract.Contract
// 메인(고객사) + 하단 탭(사업장 / 매출계약).

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useContractModel } from "./ContractModel";
import { useContractController } from "./ContractController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
} from "./ContractColumns";

export const MENU_CODE = "MENU_CONTRACT_MGMT";

// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = {
  grids: {
    main: "MAIN_GRID_CONTRACT_MGMT",
    sub01: "SUB01_GRID_CONTRACT_MGMT",
    sub02: "SUB02_GRID_CONTRACT_MGMT",
  },
};

export default function Contract() {
  const model = useContractModel(MENU_CODE);
  const ctrl = useContractController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[70, 30]}
      defaultDirection="vertical"
      storageKey={model.storageKeys.outer}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      master={
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
          columnDefs={MAIN_COLUMN_DEFS}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "BUPLA", label: "LBL_BUPLA" },
            { key: "CUST_CNTRCT", label: "LBL_AR_CONTRACT" },
          ]}
          presets={{
            BUPLA: {
              render: () => (
                <DataGrid
                  {...model.bind("sub01")}
                  authId={AUTH.grids.sub01}
                  columnDefs={SUB01_COLUMN_DEFS}
                  actions={ctrl.sub01Actions}
                />
              ),
            },
            CUST_CNTRCT: {
              render: () => (
                <DataGrid
                  {...model.bind("sub02")}
                  authId={AUTH.grids.sub02}
                  columnDefs={SUB02_COLUMN_DEFS}
                  actions={ctrl.sub02Actions}
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
