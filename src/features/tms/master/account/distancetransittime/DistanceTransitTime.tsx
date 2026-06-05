"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDistanceTransitTimeModel } from "./DistanceTransitTimeModel";
import { useDistanceTransitTimeController } from "./DistanceTransitTimeController";
import {
  MAIN_COLUMN_DEFS,
  HISTORY_COLUMN_DEFS,
} from "./DistanceTransitTimeColumns";

export const MENU_CD = "MENU_DTTO_MGMT";

export default function DistanceTransitTime() {
  const model = useDistanceTransitTimeModel(MENU_CD);
  const ctrl = useDistanceTransitTimeController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CD}
      defaultSizes={[55, 45]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      defaultDirection="horizontal"
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
      detail={
        <DataGrid
          {...model.bind("history")}
          columnDefs={HISTORY_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.historyActions}
          audit={false}
        />
      }
    />
  );
}
