"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useIfDeliveryDocumentModel } from "./IfDeliveryDocumentModel";
import { useIfDeliveryDocumentController } from "./IfDeliveryDocumentController";
import {
  MAIN_COLUMN_DEFS,
  DETAIL_COLUMN_DEFS,
} from "./IfDeliveryDocumentColumns";

export const MENU_CODE = "MENU_IF_RCV_DLVRY_DOC";

export const AUTH = {
  grids: {
    main: "MAIN_GRID_IF_RCV_DLVRY_DOC",
    detail: "SUB02_GRID_IF_RCV_DLVRY_DOC",
  },
};

export default function IfDeliveryDocument() {
  const model = useIfDeliveryDocumentModel(MENU_CODE);
  const ctrl = useIfDeliveryDocumentController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[50, 50]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
        excludes: [
          {
            column: "DLVRY_DT",
            as: { FROM: "DLVRY_DT_FROM", TO: "DLVRY_DT_TO" },
          },
        ],
      }}
      defaultDirection="vertical"
      layoutToggle={false}
      storageKey={`${model.storageKeys.outer}-sencha`}
      master={
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
          rowSelection="multiple"
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[{ key: "DETAIL", label: "LBL_DLVRY_DETAIL" }]}
          presets={{
            DETAIL: {
              render: () => (
                <DataGrid
                  {...model.bind("detail")}
                  authId={AUTH.grids.detail}
                  columnDefs={DETAIL_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={[]}
                  audit={false}
                  pagination={false}
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
