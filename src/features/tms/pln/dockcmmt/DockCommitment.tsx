"use client";

// 도크확약관리 (서버 vc.view.mdl.tms.pln.dockcmmt.DockCommitment)
// 상단: 메인 그리드(배차 목록, 36%) / 하단: 도크 스케줄러(도크=리소스, 확약=이벤트).
// 스케줄러는 센차 외부 라이브러리(Bryntum 계열) 위젯 — DockScheduler 로 자체 구현.
//   드래그/이동/리사이즈 등 상속 위젯 동작은 TODO(아래 컴포넌트 주석 참고).

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDockCommitmentModel } from "./DockCommitmentModel";
import { useDockCommitmentController } from "./DockCommitmentController";
import { MAIN_COLUMN_DEFS } from "./DockCommitmentColumns";
import { DockScheduler } from "./DockScheduler";

export const MENU_CODE = "MENU_DOCK_CMMT_MGMT";

// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = {
  grids: {
    main: "MAIN_GRID_DOCK_CMMT_MGMT",
    sub01: "SUB01_GRID_DOCK_CMMT_MGMT",
  },
};

export default function DockCommitment() {
  const model = useDockCommitmentModel(MENU_CODE);
  const ctrl = useDockCommitmentController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultDirection="vertical"
      defaultSizes={[36, 64]}
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
        <DockScheduler
          docks={ctrl.docks}
          events={ctrl.events}
          onEventClick={ctrl.onEventClick}
          onSlotSelect={ctrl.onSlotSelect}
        />
      }
    />
  );
}
