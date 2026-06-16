"use client";

// 화면 골격 (자동 생성) — 서버 view model 대응
// TODO: 실제 스펙(컬럼/조회조건/액션/팝업)에 맞춰 구현. 비즈니스 로직 미구현 상태.

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useBoxApMgmtModel } from "./BoxApMgmtModel";
import { useBoxApMgmtController } from "./BoxApMgmtController";
import { MAIN_COLUMN_DEFS } from "./BoxApMgmtColumns";

export const MENU_CODE = "MENU_BOX_AP_MGMT";

export default function BoxApMgmt() {
  const model = useBoxApMgmtModel(MENU_CODE);
  const ctrl = useBoxApMgmtController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
        />
      }
    />
  );
}
