"use client";

// 요율관리(계획단위) — 서버 vc.view.mdl.tms.tariff.assignunit.tariff.Tariff
// 메인(요율) + 하단 탭(요율항목 / 차량유형). 메인 클릭 → 두 sub cascade 조회.

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useTariffModel } from "./TariffModel";
import { useTariffController } from "./TariffController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
} from "./TariffColumns";

export const MENU_CODE = "MENU_TARIFF_BY_PLAN";

// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = {
  grids: {
    main: "MAIN_GRID_TARIFF_BY_PLAN",
    sub01: "SUB01_GRID_TARIFF_BY_PLAN",
    sub02: "SUB02_GRID_TARIFF_BY_PLAN",
  },
};

export default function Tariff() {
  const model = useTariffModel(MENU_CODE);
  const ctrl = useTariffController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[70, 30]}
      defaultDirection="vertical"
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
          rowSelection="multiple"
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "RATE", label: "LBL_RATE_ITEM" },
            { key: "VEH", label: "LBL_VEHICLE_TYPE" },
          ]}
          presets={{
            RATE: {
              render: () => (
                <DataGrid
                  {...model.bind("sub01")}
                  authId={AUTH.grids.sub01}
                  columnDefs={SUB01_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  onRowClicked={ctrl.onSub01GridClick}
                  actions={ctrl.sub01Actions}
                />
              ),
            },
            VEH: {
              render: () => (
                <DataGrid
                  {...model.bind("sub02")}
                  authId={AUTH.grids.sub02}
                  columnDefs={SUB02_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  onRowClicked={ctrl.onSub02GridClick}
                  actions={ctrl.sub02Actions}
                />
              ),
            },
          }}
          actions={[]}
        />
      }
    />
  );
}
