"use client";

// 일자별 유가 (오피넷) — 서버 vc.view.mdl.tms.tariff.oilprice.opinet.day.OilPriceByDay
// 좌: 일자별 평균유가(메인) / 중: 광역시도별(sub01) / 우: 시군구별(sub02). 3그리드 cascade.
// 각 그리드 툴바의 "추세조회" 버튼 → 시계열 차트 팝업.

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { Pane } from "@/app/components/layout/Pane";
import DataGrid from "@/app/components/grid/DataGrid";
import { useOilPriceByDayModel } from "./OilPriceByDayModel";
import { useOilPriceByDayController } from "./OilPriceByDayController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
} from "./OilPriceByDayColumns";

export const MENU_CODE = "MENU_OIL_PRICE_DAY";

// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = {
  grids: {
    main: "MAIN_GRID_OIL_PRICE_BY_DAY",
    sub01: "SUB01_GRID_OIL_PRICE_BY_DAY",
    sub02: "SUB02_GRID_OIL_PRICE_BY_DAY",
  },
};

export default function OilPriceByDay() {
  const model = useOilPriceByDayModel(MENU_CODE);
  const ctrl = useOilPriceByDayController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultDirection="horizontal"
      defaultSizes={[33, 67]}
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
          audit={false}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <SplitPane direction="horizontal" defaultSizes={[50, 50]}>
          <Pane>
            <DataGrid
              {...model.bind("sub01")}
              authId={AUTH.grids.sub01}
              columnDefs={SUB01_COLUMN_DEFS}
              codeMap={model.codeMap}
              audit={false}
              onRowClicked={ctrl.onSub01GridClick}
              actions={ctrl.sub01Actions}
            />
          </Pane>
          <Pane>
            <DataGrid
              {...model.bind("sub02")}
              authId={AUTH.grids.sub02}
              columnDefs={SUB02_COLUMN_DEFS}
              codeMap={model.codeMap}
              audit={false}
              actions={ctrl.sub02Actions}
            />
          </Pane>
        </SplitPane>
      }
    />
  );
}
