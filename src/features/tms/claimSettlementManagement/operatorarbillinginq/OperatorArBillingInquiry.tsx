"use client";

import { useEffect, useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useOperatorArBillingInquiryModel } from "./OperatorArBillingInquiryModel";
import { useOperatorArBillingInquiryController } from "./OperatorArBillingInquiryController";
import {
  MAIN_COLUMN_DEFS,
  BILLING_ITEM_COLUMN_DEFS,
  ORDER_INFO_COLUMN_DEFS,
  ATTACHMENT_COLUMN_DEFS,
} from "./OperatorArBillingInquiryColumns";

const MENU_CD = "MENU_OPERATOR_BILLING_MANAGEMENT";

export default function OperatorArBillingInquiry() {
  const { meta, loading } = useSearchMeta(MENU_CD);
  const model = useOperatorArBillingInquiryModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  // JS onSaveAfterSearch: setCompToParamExclude('PLN.AR_TO_DT')
  //   → PLN.AR_TO_DT 는 DYNAMIC_QUERY 에서 제외. 값은 fetchList 에서
  //     buildOperatorArBillingHeaderParams 처럼 AR_FROM_DT / AR_TO_DT 로 재조립.
  //   state 는 YMD 범위라 _FRM / _TO 로 쪼개져 있음 → 둘 다 exclude.
  useEffect(() => {
    excludeKeysRef.current.add("PLN.AR_TO_DT_FRM");
    excludeKeysRef.current.add("PLN.AR_TO_DT_TO");
  }, []);

  const ctrl = useOperatorArBillingInquiryController({
    model,
    searchRef,
    filtersRef,
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
            { key: "BILLING_ITEM", label: "청구항목" },
            { key: "ORDER_INFO", label: "주문정보" },
            { key: "ATTACHMENT", label: "증빙문서" },
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
