"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";

import { useOperatorArBillingInquiryModel } from "./OperatorArBillingInquiryModel";
import { useOperatorArBillingInquiryController } from "./OperatorArBillingInquiryController";
import {
  MAIN_COLUMN_DEFS,
  BILLING_ITEM_COLUMN_DEFS,
  ORDER_INFO_COLUMN_DEFS,
  ATTACHMENT_COLUMN_DEFS,
} from "./OperatorArBillingInquiryColumns";

export const MENU_CD = "MENU_OPERATOR_BILLING_MANAGEMENT";

export default function OperatorArBillingInquiry() {
  const model = useOperatorArBillingInquiryModel(MENU_CD);
  const ctrl = useOperatorArBillingInquiryController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CD}
      defaultSizes={[55, 45]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
        excludes: [
          {
            column: "PLN.AR_TO_DT",
            as: { FROM: "AR_FROM_DT", TO: "AR_TO_DT" },
            transform: (v) => String(v).replace(/-/g, ""),
          },
        ],
        menuCode: MENU_CD,
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
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "BILLING_ITEM", label: "LBL_CHARGE_DETAIL" },
            { key: "ORDER_INFO", label: "LBL_ORDER_INFO" },
            { key: "ATTACHMENT", label: "LBL_SPRT_DOC" },
          ]}
          presets={{
            BILLING_ITEM: {
              render: () => (
                <DataGrid
                  {...model.bind("billingItem")}
                  columnDefs={BILLING_ITEM_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.billingItemActions}
                  audit={false}
                />
              ),
            },
            ORDER_INFO: {
              render: () => (
                <DataGrid
                  {...model.bind("orderInfo")}
                  columnDefs={ORDER_INFO_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.orderInfoActions}
                  audit={false}
                />
              ),
            },
            ATTACHMENT: {
              render: () => (
                <DataGrid
                  {...model.bind("attachment")}
                  columnDefs={ATTACHMENT_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.attachmentActions}
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
