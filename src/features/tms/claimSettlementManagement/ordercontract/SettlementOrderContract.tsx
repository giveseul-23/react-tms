"use client";

// 정산대상_주문계약 (서버 vc.view.mdl.tms.claimSettlementManagement.ordercontract.SettlementOrderContract)
// 단일 그리드(주문계약 목록) + 다중선택. 주문별/기간합산 정산문서 생성 + 엑셀.

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSettlementOrderContractModel } from "./SettlementOrderContractModel";
import { useSettlementOrderContractController } from "./SettlementOrderContractController";
import { MAIN_COLUMN_DEFS } from "./SettlementOrderContractColumns";

export const MENU_CODE = "MENU_SETTLEMENT_TARGET_ORDER_CONSTRACT";

// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = { grids: { main: "MAIN_SETTLEMENT_ORDER_CONTRACT_MAIN" } };

export default function SettlementOrderContract() {
  const model = useSettlementOrderContractModel(MENU_CODE);
  const ctrl = useSettlementOrderContractController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          rowSelection="multiple"
        />
      }
    />
  );
}
