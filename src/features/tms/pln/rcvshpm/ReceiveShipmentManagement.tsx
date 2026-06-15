"use client";

import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";
import type { SearchMeta } from "@/features/search/search.meta.types";
import { useReceiveShipmentManagementModel } from "./ReceiveShipmentManagementModel";
import { useReceiveShipmentManagementController } from "./ReceiveShipmentManagementController";
import { MAIN_COLUMN_DEFS, SUB01_COLUMN_DEFS } from "./ReceiveShipmentManagementColumns";

export const MENU_CODE = "MENU_RCV_SHPM_MGMT";

export default function ReceiveShipmentManagement() {
  const model = useReceiveShipmentManagementModel(MENU_CODE);
  const ctrl = useReceiveShipmentManagementController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[60, 40]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
        excludes: ["PLN_ID", "PKG_TP"],
      }}
      // 초기 분할 방향만 선언. 사용자 토글값은 localStorage 자동 동기화. (기본값 "horizontal")
      defaultDirection="vertical"
      // 토글 버튼 on/off — 기본 true. 그리드 1개라 숨길 화면에서만 false 명시.
      layoutToggle={true}
      // storageKey 들은 menuCode 에서 자동 생성됨 (model.storageKeys.*)
      storageKey={model.storageKeys.outer}      
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          headerCheckbox={false}
          rowSelection="multiple"
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          gridOptions={{ onSelectionChanged: (e: any) => ctrl.onMainSelectionChanged(e?.api?.getSelectedRows?.() ?? []) }}
        />
      }
      detail={
        <SplitPane direction="vertical" defaultSizes={[55, 45]} storageKey={model.storageKeys.top}>
          <DataGrid
            {...model.bind("sub01")}
            columnDefs={SUB01_COLUMN_DEFS}
            codeMap={model.codeMap}
            headerCheckbox={false}
            actions={ctrl.sub01Actions}
            pagination={false}
          />
        </SplitPane>
      }
    />
  );
}