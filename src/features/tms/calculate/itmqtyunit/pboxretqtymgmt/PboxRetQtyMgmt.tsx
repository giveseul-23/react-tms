"use client";

// 반납박스수량관리 (서버 vc.view.mdl.tms.calculate.itmqtyunit.pboxretqtymgmt.PboxRetQtyMgmt)
// 메인(협력사단위) + 하단 탭(차량단위요약 / 상세).

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { usePboxRetQtyMgmtModel } from "./PboxRetQtyMgmtModel";
import { usePboxRetQtyMgmtController } from "./PboxRetQtyMgmtController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
} from "./PboxRetQtyMgmtColumns";

export const MENU_CODE = "MENU_PBOX_RET_QTY_MGMT";

export const AUTH = {
  grids: {
    main: "MAIN_GRID_PBOX_RET_QTY_MGMT",
    sub01: "SUB01_GRID_PBOX_RET_QTY_MGMT",
    sub02: "SUB02_GRID_PBOX_RET_QTY_MGMT",
  },
};

export default function PboxRetQtyMgmt() {
  const model = usePboxRetQtyMgmtModel(MENU_CODE);
  const ctrl = usePboxRetQtyMgmtController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[50, 50]}
      defaultDirection="vertical"
      storageKey={model.storageKeys.outer}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      master={
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          headerCheckbox={false}
          audit={{ delete: false, rowStatus: false }}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "VEH", label: "LBL_VEH_SUMMARY" },
            { key: "DTL", label: "LBL_DTL_DESC" },
          ]}
          presets={{
            VEH: {
              render: () => (
                <DataGrid
                  {...model.bind("sub01")}
                  authId={AUTH.grids.sub01}
                  columnDefs={SUB01_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.sub01Actions}
                  rowSelection="multiple"
                  audit={{ delete: false, rowStatus: false }}
                />
              ),
            },
            DTL: {
              render: () => (
                <DataGrid
                  {...model.bind("sub02")}
                  authId={AUTH.grids.sub02}
                  columnDefs={SUB02_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.sub02Actions}
                  rowSelection="multiple"
                  audit={{ delete: false, rowStatus: false }}
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
