"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
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
        onSearch: ctrl.handleSearch,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
        menuCode: MENU_CODE,
      }}
      direction={model.layout === "side" ? "horizontal" : "vertical"}
      layoutToggle={{
        layout: model.layout,
        onToggle: () =>
          model.setLayout((prev: LayoutType) =>
            prev === "side" ? "vertical" : "side",
          ),
      }}
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("config")}
          columnDefs={MAIN_COLUMN_DEFS()}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.onMainGridClick}
          audit={false}
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
              columnDefs: ORDER_COLUMN_DEFS(),
              actions: ctrl.orderActions,
              onRowClicked: ctrl.onOrderGridClick,
            },
            RECEIPT: {
              columnDefs: RECEIPT_COLUMN_DEFS(),
              actions: [],
            },
            HISTORY: {
              columnDefs: RECEIPT_HISTORY_COLUMN_DEFS(),
              actions: [],
            },
          }}
          rowData={{
            ORDER: model.grids.order.rows,
            RECEIPT: model.grids.receipt.rows,
            HISTORY: model.grids.receiptHistory.rows,
          }}
          codeMap={model.codeMap}
          actions={[]}
          renderRightGrid={(activeTabKey) => {
            if (activeTabKey === "ORDER") {
              return (
                <DataGrid
                  layoutType="plain"
                  columnDefs={ORDER_ITEM_COLUMN_DEFS()}
                  rowData={model.grids.orderItem.rows}
                  actions={[]}
                />
              );
            }
            return null;
          }}
        />
      }
    />
  );
}
