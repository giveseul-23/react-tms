"use client";

// 상품수량 정산 등록 (서버 vc.view.mdl.tms.tariff.shipment.settlqty.RegisterSettlProductQty)
// 단일 그리드 + 셀 편집(다중선택). 납품일등록 / 납품일등록취소 / 저장 액션.

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useRegisterSettlProductQtyModel } from "./RegisterSettlProductQtyModel";
import { useRegisterSettlProductQtyController } from "./RegisterSettlProductQtyController";
import { MAIN_COLUMN_DEFS } from "./RegisterSettlProductQtyColumns";

export const MENU_CODE = "MENU_REG_SETTL_QTY";

export default function RegisterSettlProductQty() {
  const model = useRegisterSettlProductQtyModel(MENU_CODE);
  const ctrl = useRegisterSettlProductQtyController({ model });

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
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          rowSelection="multiple"
        />
      }
    />
  );
}
