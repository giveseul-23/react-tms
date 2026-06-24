"use client";

// 하이패스요금관리 (서버 vc.view.mdl.tms.calculate.vhcunit.hipassmgmt.HipassFareManagement)
// 메인(하이패스매입정산문서 단위) + 우측 sub01(차량단위 상세). 좌우 분할(메인 80% / 상세 20%).

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useHipassFareManagementModel } from "./HipassFareManagementModel";
import { useHipassFareManagementController } from "./HipassFareManagementController";
import { MAIN_COLUMN_DEFS, SUB01_COLUMN_DEFS } from "./HipassFareManagementColumns";

export const MENU_CODE = "MENU_HIPASS_FARE_MGMT";

// 서버 grid.authId (그리드 리소스 권한 + 엑셀 업로드/양식 키 단일 소스).
export const AUTH = {
  grids: {
    main: "MAIN_HIPASS_FARE_MGMT",
    sub01: "SUB01_HIPASS_FARE_MGMT",
  },
};

const MAIN_SELECTION_COLUMN_DEF = {
  headerClass: "ag-selection-header-center",
  width: 30,
  minWidth: 30,
  maxWidth: 30,
  pinned: "left",
  lockPosition: "left",
};

const READ_ONLY_AUDIT = {
  delete: false,
  rowStatus: false,
  insertDateOverrides: { width: 120 },
  updateTimeOverrides: { width: 120 },
};

export default function HipassFareManagement() {
  const model = useHipassFareManagementModel(MENU_CODE);
  const ctrl = useHipassFareManagementController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[80, 20]}
      defaultDirection="horizontal"
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
          gridOptions={{ selectionColumnDef: MAIN_SELECTION_COLUMN_DEF }}
          audit={READ_ONLY_AUDIT}
        />
      }
      detail={
        <DataGrid
          {...model.bind("sub01")}
          authId={AUTH.grids.sub01}
          columnDefs={SUB01_COLUMN_DEFS}
          codeMap={model.codeMap}
          pagination={false}
          audit={READ_ONLY_AUDIT}
        />
      }
    />
  );
}
