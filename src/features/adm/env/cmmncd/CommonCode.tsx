"use client";

import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useCommonCodeModel } from "./CommonCodeModel";
import { useCommonCodeController } from "./CommonCodeController";
import {
  MAIN_COLUMN_DEFS,
  SUB01_COLUMN_DEFS,
  SUB02_COLUMN_DEFS,
} from "./CommonCodeColumns";

export const MENU_CD = "MENU_CMMN_CD";

export default function CommonCode() {
  const model = useCommonCodeModel(MENU_CD);
  const ctrl = useCommonCodeController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CD}
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
          codeMap={model.codeMap}
          headerCheckbox={false}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <SplitPane
          direction="vertical"
          defaultSizes={[50, 50]}
          storageKey={model.storageKeys.top}
        >
          <DataGrid
            {...model.bind("sub01")}
            columnDefs={SUB01_COLUMN_DEFS}
            codeMap={model.codeMap}
            headerCheckbox={false}
            onRowClicked={ctrl.onSub01GridClick}
            actions={ctrl.sub01Actions}
          />
          <DataGrid
            {...model.bind("sub02")}
            columnDefs={SUB02_COLUMN_DEFS}
            codeMap={model.codeMap}
            headerCheckbox={false}
            actions={ctrl.sub02Actions}
            pagination={false}
          />
        </SplitPane>
      }
    />
  );
}
