"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";

import { useIfDeliveryDocumentModel } from "./IfDeliveryDocumentModel";
import { useIfDeliveryDocumentController } from "./IfDeliveryDocumentController";
import {
  MAIN_COLUMN_DEFS,
  DETAIL_COLUMN_DEFS,
} from "./IfDeliveryDocumentColumns";

export const MENU_CODE = "MENU_IF_RCV_DLVRY_DOC";

export default function IfDeliveryDocument() {
  const model = useIfDeliveryDocumentModel(MENU_CODE);
  const ctrl = useIfDeliveryDocumentController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[55, 45]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      defaultDirection="horizontal"
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
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
                  columnDefs={DETAIL_COLUMN_DEFS}
                  actions={ctrl.detailActions}
                  audit={false}
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
