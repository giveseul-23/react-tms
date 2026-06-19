"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";

import { useConfirmDispatchModel } from "./ConfirmDispatchModel";
import { useConfirmDispatchController } from "./ConfirmDispatchController";
import {
  MAIN_COLUMN_DEFS,
  ORDER_COLUMN_DEFS,
  ORDER_ITEM_COLUMN_DEFS,
  RECEIPT_COLUMN_DEFS,
  RECEIPT_HISTORY_COLUMN_DEFS,
} from "./ConfirmDispatchColumns";

export const MENU_CODE = "MENU_ASSIGN_CONFIRM";

export default function ConfirmDispatch() {
  const model = useConfirmDispatchModel(MENU_CODE);
  const ctrl = useConfirmDispatchController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[50, 50]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      defaultDirection="vertical"
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("config")}
          columnDefs={MAIN_COLUMN_DEFS()}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.onMainGridClick}
          rowSelection="multiple"
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "ORDER", label: "LBL_ORDER_INFO" },
            { key: "RECEIPT", label: "LBL_POD" },
            { key: "HISTORY", label: "LBL_POD_ISSUE_HISTORY" },
          ]}
          presets={{
            ORDER: {
              render: () => (
                <SplitPane direction="horizontal" defaultSizes={[70, 30]}>
                  <DataGrid
                    {...model.bind("order")}
                    columnDefs={ORDER_COLUMN_DEFS()}
                    codeMap={model.codeMap}
                    actions={ctrl.orderActions}
                    onRowClicked={ctrl.onOrderGridClick}
                    audit={false}
                  />
                  <DataGrid
                    {...model.bind("orderItem")}
                    columnDefs={ORDER_ITEM_COLUMN_DEFS()}
                    actions={[]}
                  />
                </SplitPane>
              ),
            },
            RECEIPT: {
              render: () => (
                <DataGrid
                  {...model.bind("receipt")}
                  columnDefs={RECEIPT_COLUMN_DEFS()}
                  codeMap={model.codeMap}
                  actions={[]}
                  audit={false}
                />
              ),
            },
            HISTORY: {
              render: () => (
                <DataGrid
                  {...model.bind("receiptHistory")}
                  columnDefs={RECEIPT_HISTORY_COLUMN_DEFS()}
                  codeMap={model.codeMap}
                  actions={[]}
                  audit={{
                    delete: false,
                    rowStatus: false,
                    insertPerson: true,
                    insertDate: true,
                    updatePerson: false,
                    updateTime: false,
                  }}
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
