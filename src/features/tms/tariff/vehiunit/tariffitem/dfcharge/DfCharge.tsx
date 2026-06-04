"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDfChargeModel } from "./DfChargeModel";
import { useDfChargeController } from "./DfChargeController";
import { MAIN_COLUMN_DEFS, DETAIL_COLUMN_DEFS } from "./DfChargeColumns";

// TODO: 실제 메뉴 코드로 교체
export const MENU_CODE = "MENU_DF_BASED_CHARGE_CODE";

export default function DfCharge() {
  const model = useDfChargeModel(MENU_CODE);
  const ctrl = useDfChargeController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[40, 60]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      defaultDirection="horizontal"
      layoutToggle={true}
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          codeMap={model.codeMap}
        />
      }
      detail={
        <DataGrid
          {...model.bind("detail")}
          columnDefs={DETAIL_COLUMN_DEFS}
          actions={ctrl.detailActions}
          model={model}
        />
      }
    />
  );
}
