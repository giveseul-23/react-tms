"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useUserGroupModel } from "./UserGroupModel";
import { useUserGroupController } from "./UserGroupController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
  SUB03_COLUMN_DEFS,
} from "./UserGroupColumns";

export const MENU_CD = "MENU_USER_GROUP";

export default function UserGroup() {
  const model = useUserGroupModel(MENU_CD);
  const ctrl = useUserGroupController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CD}
      defaultDirection="vertical"
      defaultSizes={[50, 50]}
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
          columnDefs={MAIN_COLUMN_DEFS}
          headerCheckbox={false}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "APPLICATION", label: "LBL_APPLICATION" },
            { key: "USER", label: "LBL_USER" },
            { key: "ROLE", label: "LBL_ROLE_MGMT" },
          ]}
          presets={{
            APPLICATION: {
              render: () => (
                <DataGrid
                  {...model.bind("sub01")}
                  columnDefs={SUB01_COLUMN_DEFS}
                  headerCheckbox={false}
                  pagination={false}
                  actions={ctrl.subActions.sub01}
                />
              ),
            },
            USER: {
              render: () => (
                <DataGrid
                  {...model.bind("sub02")}
                  columnDefs={SUB02_COLUMN_DEFS}
                  headerCheckbox={false}
                  actions={ctrl.subActions.sub02}
                />
              ),
            },
            ROLE: {
              render: () => (
                <DataGrid
                  {...model.bind("sub03")}
                  columnDefs={SUB03_COLUMN_DEFS}
                  headerCheckbox={false}
                  pagination={false}
                  actions={ctrl.subActions.sub03}
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
