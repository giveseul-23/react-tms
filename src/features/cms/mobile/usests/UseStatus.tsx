"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import { useSearchMeta } from "@/hooks/useSearchMeta";
import { useUseStatusModel } from "./UseStatusModel";
import { useUseStatusController } from "./UseStatusController";
import UseStatusOverWrapPanel from "./UseStatusOverWrapPanel";

export const MENU_CODE = "MENU_MBL_CTRL";

export default function UseStatus() {
  const model = useUseStatusModel(MENU_CODE);
  const ctrl = useUseStatusController({ model });
  const primary = useSearchMeta(MENU_CODE);
  const fallback = useSearchMeta("MENU_MBL_USE_STS");
  const meta = primary.meta.length > 0 ? primary.meta : fallback.meta;
  const loading = primary.loading || (!primary.meta.length && fallback.loading);

  return (
    <GridOnlyPage
      searchProps={{
        meta,
        loading,
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      grid={
        <UseStatusOverWrapPanel
          model={model}
          mainActions={ctrl.mainActions}
          carrierActions={ctrl.carrierActions}
          onClickBar={ctrl.handleChartBarClick}
          onCloseFilter={ctrl.handleCloseFilter}
        />
      }
    />
  );
}
