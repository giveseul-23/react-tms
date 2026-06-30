"use client";

// 인수증(POD) 리포트 (서버 vc.view.mdl.tms.execution.podrpt.PodReport)
// 메인(인수증) + 하단 탭:
//   탭1 인수상품정보 → sub01(상품) 좌 + sub02(거절·반품) 우 좌우 분할
//   탭2 POD 이미지   → sub03(파일목록) 좌 + 이미지 미리보기 패널 우 좌우 분할

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import DataGrid from "@/app/components/grid/DataGrid";

import { usePodReportModel } from "./PodReportModel";
import { usePodReportController } from "./PodReportController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
  SUB03_COLUMN_DEFS,
} from "./PodReportColumns";
import { PodImagePanel } from "./popup/PodImagePanel";

export const MENU_CODE = "MENU_POD_RPT";

export const AUTH = {
  grids: {
    main: "MAIN_GRID_POD_RPT",
    sub01: "SUB01_GRID_POD_RPT",
    sub02: "SUB02_GRID_POD_RPT",
    sub03: "SUB03_GRID_POD_RPT",
  },
};

export default function PodReport() {
  const model = usePodReportModel(MENU_CODE);
  const ctrl = usePodReportController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[50, 50]}
      defaultDirection="vertical"
      storageKey={model.storageKeys.outer}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        menuCode: MENU_CODE,
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
          audit={{ delete: false }}
        />
      }
      detail={
        < DataGrid
          layoutType="tab"
          tabs={
            [
              { key: "ITEM", label: "LBL_TAKEOVER_ITM_INFO" },
              { key: "IMAGE", label: "LBL_POD_IMAGE" },
            ]}
          onTabChange={ctrl.onDetailTabChange}
          presets={{
            ITEM: {
              render: () => (
                <SplitPane direction="horizontal" defaultSizes={[60, 40]}>
                  <DataGrid
                    {...model.bind("sub01")}
                    authId={AUTH.grids.sub01}
                    columnDefs={SUB01_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    onRowClicked={ctrl.onSub01GridClick}
                    actions={ctrl.sub01Actions}
                    headerCheckbox={false}
                    audit={false}
                  />
                  <DataGrid
                    {...model.bind("sub02")}
                    authId={AUTH.grids.sub02}
                    columnDefs={SUB02_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    actions={ctrl.sub02Actions}
                    headerCheckbox={false}
                    audit={false}
                  />
                </SplitPane>
              ),
            },
            IMAGE: {
              render: () => (
                <SplitPane direction="horizontal" defaultSizes={[60, 40]}>
                  <DataGrid
                    {...model.bind("sub03")}
                    authId={AUTH.grids.sub03}
                    columnDefs={SUB03_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    onRowClicked={ctrl.onSub03GridClick}
                    onRowDoubleClicked={ctrl.onSub03GridDblClick}
                    actions={ctrl.sub03Actions}
                    rowSelection="multiple"
                    audit={{ updatePerson: false, updateTime: false, delete: false, rowStatus: false }}
                    headerCheckbox={false}
                  />
                  <PodImagePanel image={model.image} />
                </SplitPane>
              ),
            },
          }}
          actions={[]}
        />
      }
    />
  );
}
