import { useState, useRef, useCallback, useMemo } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";

export type GridData = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

const EMPTY_GRID: GridData = {
  rows: [],
  totalCount: 0,
  page: 1,
  limit: 500,
};

export function useConfirmDispatchModel() {
  const [layout, setLayout] = useState<LayoutType>("vertical");
  const [pageSize, setPageSize] = useState(500);

  const [gridData, setGridData] = useState<GridData>(EMPTY_GRID);

  // 주문정보
  const [orderRowData, setOrderRowData] = useState<any[]>([]);
  const [orderItemRowData, setOrderItemRowData] = useState<any[]>([]);

  // 인수증
  const [receiptRowData, setReceiptRowData] = useState<any[]>([]);
  // 인수증 발행이력
  const [receiptHistoryRowData, setReceiptHistoryRowData] = useState<any[]>([]);

  const [selectedHeaderRow, setSelectedHeaderRow] = useState<any>(null);
  const selectedHeaderRowRef = useRef<any>(null);
  const setSelectedHeaderRowWithRef = useCallback((row: any) => {
    setSelectedHeaderRow(row);
    selectedHeaderRowRef.current = row;
  }, []);

  const [selectedOrderRow, setSelectedOrderRow] = useState<any>(null);

  const resetSubGrids = useCallback(() => {
    setSelectedHeaderRowWithRef(null);
    setOrderRowData([]);
    setOrderItemRowData([]);
    setReceiptRowData([]);
    setReceiptHistoryRowData([]);
    setSelectedOrderRow(null);
  }, [setSelectedHeaderRowWithRef]);

  const { stores } = useCommonStores({
    dspchPrgSts: { sqlProp: "CODE", keyParam: "DSPCH_PRG_STS" },
    assignSts: { sqlProp: "CODE", keyParam: "ASSIGN_STS" },
    ordTp: { sqlProp: "CODE", keyParam: "ORD_TP" },
    vehOpTp: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
    rcptIssueSts: { sqlProp: "CODE", keyParam: "RCPT_ISSUE_STS" },
    rcptIssueTp: { sqlProp: "CODE", keyParam: "RCPT_ISSUE_TP" },
  });

  const codeMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    Object.entries(stores).forEach(([storeKey, items]) => {
      map[storeKey] = {};
      (items ?? []).forEach((item: any) => {
        map[storeKey][item.CODE] = item.NAME;
      });
    });
    return map;
  }, [stores]);

  return {
    layout,
    setLayout,
    pageSize,
    setPageSize,
    gridData,
    setGridData,
    orderRowData,
    setOrderRowData,
    orderItemRowData,
    setOrderItemRowData,
    receiptRowData,
    setReceiptRowData,
    receiptHistoryRowData,
    setReceiptHistoryRowData,
    selectedHeaderRow,
    selectedHeaderRowRef,
    setSelectedHeaderRow: setSelectedHeaderRowWithRef,
    selectedOrderRow,
    setSelectedOrderRow,
    resetSubGrids,
    codeMap,
  };
}

export type ConfirmDispatchModel = ReturnType<typeof useConfirmDispatchModel>;
