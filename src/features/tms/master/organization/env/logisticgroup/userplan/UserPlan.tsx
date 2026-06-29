"use client";

import { useMemo } from "react";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useUserPlanModel } from "./UserPlanModel";
import { useUserPlanController } from "./UserPlanControllers";
import { MAIN_COLUMN_DEFS } from "./UserPlanColumns";

export const MENU_CD = "MENU_USER_PLAN_MGMT";

// 서버 리소스 권한 authId (센차 grid authId). 그리드별 authId 단일 소스.
export const AUTH = {
  grids: {
    main: "MAIN_GRID_USER_PLAN_MGMT",
  },
};

export default function UserPlan() {
  const model = useUserPlanModel(MENU_CD);
  const ctrl = useUserPlanController({ model });

  const mainColumnDefs = useMemo(
    () => MAIN_COLUMN_DEFS(ctrl.getLgstGrpCd),
    [ctrl.getLgstGrpCd],
  );

  return (
    <GridOnlyPage
      searchProps={{
        meta: model.searchMeta,
        loading: model.searchMetaLoading,
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        menuCode: MENU_CD,
        ...model.bindSearch(),
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
          columnDefs={mainColumnDefs}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
        />
      }
    />
  );
}
