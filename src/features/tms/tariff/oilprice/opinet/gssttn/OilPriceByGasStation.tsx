"use client";

// 주유소별 유가 (오피넷) — 서버 vc.view.mdl.tms.tariff.oilprice.opinet.gssttn.OilPriceByGasStation
// 상단: 주유소(메인) / 하단: 주유소별 평균유가(sub01) + 평균유가 추이 차트.

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { Pane } from "@/app/components/layout/Pane";
import DataGrid from "@/app/components/grid/DataGrid";
import { useOilPriceByGasStationModel } from "./OilPriceByGasStationModel";
import { useOilPriceByGasStationController } from "./OilPriceByGasStationController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
} from "./OilPriceByGasStationColumns";
import OilPriceByGasStationChartPanel from "./OilPriceByGasStationChartPanel";

export const MENU_CODE = "MENU_OIL_PRICE_STATION";

// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = {
  grids: {
    main: "MAIN_GRID_OIL_PRICE_BY_GSST",
    sub01: "SUB01_GRID_OIL_PRICE_BY_GSST",
  },
};

export default function OilPriceByGasStation() {
  const model = useOilPriceByGasStationModel(MENU_CODE);
  const ctrl = useOilPriceByGasStationController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultDirection="vertical"
      defaultSizes={[50, 50]}
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
        />
      }
      detail={
        <SplitPane direction="horizontal" defaultSizes={[40, 60]}>
          <Pane>
            <DataGrid
              {...model.bind("sub01")}
              authId={AUTH.grids.sub01}
              columnDefs={SUB01_COLUMN_DEFS}
              codeMap={model.codeMap}
              audit={false}
              actions={ctrl.sub01Actions}
            />
          </Pane>
          <Pane>
            <OilPriceByGasStationChartPanel data={model.chartData} />
          </Pane>
        </SplitPane>
      }
    />
  );
}
