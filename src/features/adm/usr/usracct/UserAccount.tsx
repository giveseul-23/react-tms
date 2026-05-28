"use client";

import { useMemo, useRef, useState } from "react";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { Pane } from "@/app/components/layout/Pane";
import { OuterTabs } from "@/app/components/layout/OuterTabs";
import DataGrid from "@/app/components/grid/DataGrid";
import TreeGrid, { type TreeCellContext } from "@/app/components/grid/TreeGrid";
import TreeNameCell from "@/app/components/grid/TreeGrid/TreeNameCell";
import { Lang } from "@/app/services/common/Lang";
import { useUserAccountModel } from "./UserAccountModel";
import { useUserAccountController } from "./UserAccountController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB03_COLUMN_DEFS,
} from "./UserAccountColumns";

export const MENU_CD = "MENU_USER_ACCOUNT";

export default function UserAccount() {
  const [activeTab, setActiveTab] = useState<"USER_GROUP" | "ROLE">(
    "USER_GROUP",
  );
  const activeTabRef = useRef<"USER_GROUP" | "ROLE">("USER_GROUP");

  const model = useUserAccountModel(MENU_CD);
  const ctrl = useUserAccountController({ model, activeTabRef });
  const sub01ColumnDefs = useMemo(
    () => SUB01_COLUMN_DEFS(model.grids.sub01.setData),
    [model.grids.sub01],
  );
  const renderRoleTreeNameCell = (params: any, ctx: TreeCellContext) => {
    const row = params.data;
    return (
      <TreeNameCell
        id={row.id}
        level={row.level}
        label={row.RSRC_ID}
        hasChild={row.LEAFYN === "N"}
        ctx={ctx}
      />
    );
  };

  return (
    <MasterDetailPage
      menuCode={MENU_CD}
      defaultDirection="vertical"
      defaultSizes={[52, 48]}
      storageKey={model.storageKeys.outer}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
        menuCode: MENU_CD,
      }}
      master={
        <DataGrid
          {...model.bind("main")}
          audit={false}
          codeMap={model.codeMap}
          columnDefs={MAIN_COLUMN_DEFS}
          headerCheckbox={false}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <div className="flex flex-col h-full min-h-0">
          <OuterTabs
            tabs={[
              { key: "USER_GROUP", label: Lang.get("MENU_USER_GROUP") },
              { key: "ROLE", label: Lang.get("LBL_RSRC_RL_MGMT") },
            ]}
            activeTab={activeTab}
            onChange={(key) => {
              const tab = key as "USER_GROUP" | "ROLE";
              setActiveTab(tab);
              void ctrl.onDetailTabChange(tab);
            }}
          />

          <div className="flex-1 min-h-0">
            {activeTab === "USER_GROUP" ? (
              <DataGrid
                {...model.bind("sub01")}
                audit={false}
                columnDefs={sub01ColumnDefs}
                headerCheckbox={false}
                actions={ctrl.sub01Actions}
              />
            ) : (
              <SplitPane
                direction="horizontal"
                defaultSizes={[30, 70]}
                storageKey={model.storageKeys.bottom}
              >
                <Pane>
                  <DataGrid
                    {...model.bind("sub03")}
                    audit={false}
                    columnDefs={SUB03_COLUMN_DEFS}
                    headerCheckbox={false}
                    onRowClicked={ctrl.onRoleGridClick}
                    actions={[]}
                  />
                </Pane>
                <Pane>
                  <TreeGrid
                    source={model.roleTreeRows}
                    renderNameCell={renderRoleTreeNameCell}
                    columnDefs={ctrl.roleTreeColumnDefs}
                    nameColumnHeader={Lang.get("LBL_RSRC_ID")}
                    nameColumnWidth={240}
                    defaultExpandLevel={-1}
                    getRowId={(p) => String(p.data.id)}
                    actions={ctrl.roleTreeActions}
                  />
                </Pane>
              </SplitPane>
            )}
          </div>
        </div>
      }
    />
  );
}
