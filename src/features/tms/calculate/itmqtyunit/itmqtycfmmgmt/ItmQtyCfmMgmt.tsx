"use client";

// 물동량확정관리 (서버 vc.view.mdl.tms.calculate.itmqtyunit.itmqtycfmmgmt.ItmQtyCfmMgmt)
// 메인(물동량) + 하단 탭(배차할당운송 / 운송상세 / 수치변경이력).

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useItmQtyCfmMgmtModel } from "./ItmQtyCfmMgmtModel";
import { useItmQtyCfmMgmtController } from "./ItmQtyCfmMgmtController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
  SUB03_COLUMN_DEFS,
} from "./ItmQtyCfmMgmtColumns";

export const MENU_CODE = "MENU_ITM_QTY_CFM_MGMT";

export default function ItmQtyCfmMgmt() {
  const model = useItmQtyCfmMgmtModel(MENU_CODE);
  const ctrl = useItmQtyCfmMgmtController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[60, 40]}
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
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          rowSelection="multiple"
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "SHPM", label: "LBL_ASSIGN_SHPM" },
            { key: "DTL", label: "LBL_SHPM_DTL" },
            { key: "CHG", label: "LBL_ITM_QTY_CHG_HISTORY" },
          ]}
          presets={{
            SHPM: {
              render: () => (
                <DataGrid
                  {...model.bind("sub01")}
                  columnDefs={SUB01_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  onRowClicked={ctrl.onSub01GridClick}
                  actions={ctrl.sub01Actions}
                />
              ),
            },
            DTL: {
              render: () => (
                <DataGrid
                  {...model.bind("sub02")}
                  columnDefs={SUB02_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  onRowClicked={ctrl.onSub02GridClick}
                  actions={ctrl.sub02Actions}
                />
              ),
            },
            CHG: {
              render: () => (
                <DataGrid
                  {...model.bind("sub03")}
                  columnDefs={SUB03_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.sub03Actions}
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
