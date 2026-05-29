"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useErrorLogModel } from "./ErrorLogModel";
import { useErrorLogController } from "./ErrorLogController";
import {
  MAIN_COLUMN_DEFS
} from "./ErrorLogColumns";

export const MENU_CD = "MENU_EXCEPTION_LOG";

export default function ErrorLog() {
  const model = useErrorLogModel(MENU_CD);
  const ctrl = useErrorLogController({ model });

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
          audit={{insertPerson:false, insertDate: false, updatePerson: false, updateTime: false, rowStatus: false, delete: false}}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "ERROR", label: "LBL_ERROR_DESC" },
            { key: "PARAMETOR", label: "LBL_PARAMETOR" },
          ]}
          presets={{
            ERROR: {
              render: () => (
                <div className="flex flex-col h-full">
                <textarea
                    readOnly
                    className="flex-1 w-full resize-none border rounded p-2 box-border"
                    value={
                        model.grids.sub01.data?.rows?.[0]?.ROOT_CAUSE_STACK ?? ""
                    }
                />
                </div>
              ),
            },
            PARAMETOR: {
              render: () => (
                <div className="flex flex-col h-full">
                <textarea
                    readOnly
                    className="flex-1 w-full resize-none border rounded p-2 box-border"
                    value={
                        model.grids.sub02.data?.rows?.[0]?.PARAMETERS ?? ""
                    }
                />
                </div>
              ),
            },
          }}
          actions={[]}
        />
      }
    />
  );
}
