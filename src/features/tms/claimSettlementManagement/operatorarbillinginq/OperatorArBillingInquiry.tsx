"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";
import { useSearchCondition } from "@/hooks/useSearchCondition";

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
  const { meta, loading } = useSearchMeta(MENU_CD);
  const model = useOperatorArBillingInquiryModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  // JS onSaveAfterSearch + buildOperatorArBillingHeaderParams 선언형 대응:
  //   - PLN.AR_TO_DT 는 dsSearchCondition 배열에서 제외 (_FRM/_TO 자동 처리)
  //   - 값은 AR_FROM_DT / AR_TO_DT 로 top-level 리네임 + 하이픈 제거
  //   Controller 는 searchCondition.transformParams(params) 한 줄로 처리.
  const searchCondition = useSearchCondition({
    meta,
    excludeKeysRef,
    filtersRef,
    excludes: [
      {
        column: "PLN.AR_TO_DT",
        as: { FROM: "AR_FROM_DT", TO: "AR_TO_DT" },
        transform: (v) => String(v).replace(/-/g, ""),
      },
    ],
  });

  const ctrl = useOperatorArBillingInquiryController({
    model,
    searchRef,
    filtersRef,
    searchCondition,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <MasterDetailPage
      defaultSizes={[55, 45]}
      searchProps={{
        meta,
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        pageSize: model.pageSize,
        excludeKeysRef,
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
      storageKey="operator-ar-billing-inquiry"
      master={
        <DataGrid
          layoutType="plain"
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          rowData={model.gridData.rows}
          totalCount={model.gridData.totalCount}
          currentPage={model.gridData.page}
          pageSize={model.pageSize}
          onPageSizeChange={model.setPageSize}
          onPageChange={(page) => {
            model.resetSubGrids();
            searchRef.current?.(page);
          }}
          onRowClicked={ctrl.handleRowClicked}
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
              columnDefs: BILLING_ITEM_COLUMN_DEFS,
              actions: ctrl.billingItemActions,
            },
            ORDER_INFO: {
              columnDefs: ORDER_INFO_COLUMN_DEFS,
              actions: ctrl.orderInfoActions,
            },
            ATTACHMENT: {
              columnDefs: ATTACHMENT_COLUMN_DEFS,
              actions: ctrl.attachmentActions,
            },
          }}
          rowData={{
            BILLING_ITEM: model.billingItemRowData,
            ORDER_INFO: model.orderInfoRowData,
            ATTACHMENT: model.attachmentRowData,
          }}
          codeMap={model.codeMap}
          actions={[]}
        />
      }
    />
  );
}
