"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useCreateDispatchModel } from "./CreateDispatchModel";
import { useCreateDispatchController } from "./CreateDispatchController";
import { MAIN_COLUMN_DEFS, SUB01_COLUMN_DEFS } from "./CreateDispatchColumns";

export const MENU_CODE = "MENU_CRE_DSPCH";
// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = {
  grids: { main: "MAIN_GRID_CRE_DSPCH", sub01: "SUB01_GRID_CRE_DSPCH" },
};

// 이관된 행(TRANSFERED_YN==='Y') 배경 강조 (센차 viewConfig.getRowClass / 'empBackground')
const getRowClass = (p: any) =>
  p?.data?.TRANSFERED_YN === "Y" ? "bg-yellow-50" : "";

export default function CreateDispatch() {
  const model = useCreateDispatchModel(MENU_CODE);
  const ctrl = useCreateDispatchController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[80, 20]}
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
          headerCheckbox={false}
          rowSelection="multiple"
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          gridOptions={{
            getRowClass,
            onSelectionChanged: (e: any) =>
              ctrl.onMainSelectionChanged(e?.api?.getSelectedRows?.() ?? []),
          }}
        />
      }
      detail={
        <DataGrid
          {...model.bind("sub01")}
          authId={AUTH.grids.sub01}
          columnDefs={SUB01_COLUMN_DEFS}
          codeMap={model.codeMap}
          headerCheckbox={false}
          rowSelection="multiple"
          actions={ctrl.sub01Actions}
          gridOptions={{
            onSelectionChanged: (e: any) =>
              ctrl.onSub01SelectionChanged(e?.api?.getSelectedRows?.() ?? []),
          }}
        />
      }
    />
  );
}
