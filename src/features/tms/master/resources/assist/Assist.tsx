"use client";

// 헬퍼관리 (서버 vc.view.mdl.tms.master.resources.assist.Assist)
// 메인(헬퍼) + 하단 탭(소속: 물류운영그룹).

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useAssistModel } from "./AssistModel";
import { useAssistController } from "./AssistController";
import { MAIN_COLUMN_DEFS, SUB01_COLUMN_DEFS } from "./AssistColumns";

export const MENU_CODE = "MENU_HELPER_MGMT";

// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = {
  grids: { main: "MAIN_GRID_HELPER_MGMT", sub01: "SUB01_GRID_HELPER_MGMT" },
};

export default function Assist() {
  const model = useAssistModel(MENU_CODE);
  const ctrl = useAssistController({ model });

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
          tabs={[{ key: "BELONG", label: "LBL_BELONG_TO" }]}
          presets={{
            BELONG: {
              render: () => (
                <DataGrid
                  {...model.bind("sub01")}
                  authId={AUTH.grids.sub01}
                  columnDefs={SUB01_COLUMN_DEFS}
                  actions={ctrl.sub01Actions}
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
