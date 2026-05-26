"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDistanceTransitTimeHisModel } from "./DistanceTransitTimeHisModel";
import { useDistanceTransitTimeHisController } from "./DistanceTransitTimeHisController";
import { MAIN_COLUMN_DEFS, DETAIL_COLUMN_DEFS } from "./DistanceTransitTimeHisColumns";

// TODO: 실제 메뉴 코드로 교체
export const MENU_CODE = "MENU_DTTO_HIS_MGMT";

export default function DistanceTransitTimeHis() {
  const model = useDistanceTransitTimeHisModel(MENU_CODE);
  const ctrl = useDistanceTransitTimeHisController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[40, 60]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
      }}
      defaultDirection="horizontal"
      layoutToggle={true}
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          audit={false}
          onRowClicked={ctrl.onMainGridClick}
        />
      }
      detail={
        <DataGrid
          {...model.bind("detail")}
          columnDefs={DETAIL_COLUMN_DEFS}
          audit={false}
        />
      }
    />
  );
}