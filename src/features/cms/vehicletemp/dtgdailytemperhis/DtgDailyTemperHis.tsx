"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useDtgDailyTemperHisModel } from "./DtgDailyTemperHisModel";
import { useDtgDailyTemperHisController } from "./DtgDailyTemperHisController";
import { MAIN_COLUMN_DEFS } from "./DtgDailyTemperHisColumns";
import DtgDailyTemperHisChartPanel from "./DtgDailyTemperHisChartPanel";

export const MENU_CODE = "MENU_DTG_DAILY_TEMPER_HIS";

export default function DtgDailyTemperHis() {
  const model = useDtgDailyTemperHisModel(MENU_CODE);
  const ctrl = useDtgDailyTemperHisController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[40, 60]}
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
          columnDefs={MAIN_COLUMN_DEFS()}
          codeMap={model.codeMap}
          headerCheckbox={false}
          audit={false}
          onRowClicked={ctrl.handleRowClicked}
        />
      }
      detail={
        <DtgDailyTemperHisChartPanel
          fridgeData={model.fridgeData}
          frozenData={model.frozenData}
          standard={model.standard}
        />
      }
    />
  );
}
