"use client";

// 물동량단위 정산관리 (서버 vc.view.mdl.tms.calculate.itmqtyunit.itmqtysettlmgmt.ItmQtySettlMgmt)
// 메인(물동량/협력사단위) + 하단 좌(요율항목 sub01) / 우(구간상세 sub02) 분할.

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import DataGrid from "@/app/components/grid/DataGrid";

import { useItmQtySettlMgmtModel } from "./ItmQtySettlMgmtModel";
import { useItmQtySettlMgmtController } from "./ItmQtySettlMgmtController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
} from "./ItmQtySettlMgmtColumns";

export const MENU_CODE = "MENU_QTY_SETTL_MGMT";

// 서버 grid.authId (그리드 리소스 권한 + 엑셀 업로드/양식 키 단일 소스).
export const AUTH = {
  grids: {
    main: "MAIN_GRID_ITM_QTY_SETTL_MGMT",
    sub01: "SUB01_GRID_ITM_QTY_SETTL_MGMT",
    sub02: "SUB02_GRID_ITM_QTY_SETTL_MGMT",
  },
};

export default function ItmQtySettlMgmt() {
  const model = useItmQtySettlMgmtModel(MENU_CODE);
  const ctrl = useItmQtySettlMgmtController({ model });

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
          authId={AUTH.grids.main}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          rowSelection="multiple"
        />
      }
      detail={
        <SplitPane
          direction="horizontal"
          defaultSizes={[50, 50]}
          storageKey={model.storageKeys.bottom}
        >
          <DataGrid
            {...model.bind("sub01")}
            authId={AUTH.grids.sub01}
            columnDefs={SUB01_COLUMN_DEFS}
            codeMap={model.codeMap}
            onRowClicked={ctrl.onSub01GridClick}
            actions={ctrl.sub01Actions}
          />
          <DataGrid
            {...model.bind("sub02")}
            authId={AUTH.grids.sub02}
            columnDefs={SUB02_COLUMN_DEFS}
            codeMap={model.codeMap}
            onRowClicked={ctrl.onSub02GridClick}
            actions={ctrl.sub02Actions}
            gridOptions={{
              onCellDoubleClicked: ctrl.onSub02CellDoubleClicked,
            }}
          />
        </SplitPane>
      }
    />
  );
}
