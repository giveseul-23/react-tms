"use client";

import { useMemo, useRef } from "react";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import DataGrid from "@/app/components/grid/DataGrid";
import TreeGrid, {
  type TreeCellContext,
  type TreeGridHandle,
} from "@/app/components/grid/TreeGrid";
import TreeNameCell from "@/app/components/grid/TreeGrid/TreeNameCell";
import { Lang } from "@/app/services/common/Lang";
import { MENU_CD } from "./RoleResourcesByUserGroupManagementApi";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  makeRoleTreeColumnDefs,
} from "./RoleResourcesByUserGroupManagementColumns";
import { useRoleResourcesByUserGroupManagementModel } from "./RoleResourcesByUserGroupManagementModel";
import { useRoleResourcesByUserGroupManagementController } from "./RoleResourcesByUserGroupManagementController";

export default function RoleResourcesByUserGroupManagement() {
  const model = useRoleResourcesByUserGroupManagementModel();
  const treeGridRef = useRef<TreeGridHandle>(null);
  const ctrl = useRoleResourcesByUserGroupManagementController({
    model,
    treeGridRef,
  });

  const selectedRoleType = String(
    model.grids.sub01.selected?.RL_TP_CD ?? "",
  ).toUpperCase();

  const treeColumnDefs = useMemo(
    () => makeRoleTreeColumnDefs(model.setRoleTreeRows, selectedRoleType),
    [model.setRoleTreeRows, selectedRoleType],
  );

  const renderRoleTreeNameCell = (params: any, ctx: TreeCellContext) => {
    const row = params.data;
    const hasChild = model.roleTreeRows.some((item) => item.parentId === row.id);

    return (
      <TreeNameCell
        id={row.id}
        level={row.level}
        label={row.RSRC_ID}
        hasChild={hasChild}
        ctx={ctx}
      />
    );
  };

  const sub02Title = [
    model.grids.main.selected?.USR_GRP_NM,
    model.grids.sub01.selected?.RL_NM,
  ]
    .filter(Boolean)
    .join(" > ");

  return (
    <MasterDetailPage
      menuCode={MENU_CD}
      defaultSizes={[30, 70]}
      storageKey={model.storageKeys.outer}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        rawFiltersRef: model.rawFiltersRef,
        pageSize: model.pageSize,
        menuCode: MENU_CD,
      }}
      master={
        <SplitPane
          direction="vertical"
          defaultSizes={[50, 50]}
          storageKey={model.storageKeys.top}
        >
          <DataGrid
            {...model.bind("main")}
            columnDefs={MAIN_COLUMN_DEFS}
            headerCheckbox={false}
            onRowClicked={ctrl.onMainGridClick}
            actions={[]}
          />
          <DataGrid
            {...model.bind("sub01")}
            columnDefs={SUB01_COLUMN_DEFS}
            headerCheckbox={false}
            onRowClicked={ctrl.onSub01GridClick}
            actions={[]}
          />
        </SplitPane>
      }
      detail={
        <div className="h-full min-h-0 flex flex-col">
          <div className="shrink-0 px-3 py-2 border border-gray-200 rounded-t-lg bg-slate-50 text-sm font-medium text-slate-700">
            {sub02Title || "\u00A0"}
          </div>
          <div className="flex-1 min-h-0">
            <TreeGrid
              ref={treeGridRef}
              source={model.roleTreeRows}
              renderNameCell={renderRoleTreeNameCell}
              columnDefs={treeColumnDefs}
              nameColumnHeader={Lang.get("LBL_RSRC_ID")}
              nameColumnWidth={180}
              sortField="RSRC_ID"
              defaultExpandLevel={-1}
              headerCheckbox={true}
              actions={ctrl.treeActions}
            />
          </div>
        </div>
      }
    />
  );
}
