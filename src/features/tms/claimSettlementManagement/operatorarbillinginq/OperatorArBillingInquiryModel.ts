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

export function useOperatorArBillingInquiryModel() {
  const [layout, setLayout] = useState<LayoutType>("vertical");
  const [pageSize, setPageSize] = useState(500);

  const [gridData, setGridData] = useState<GridData>(EMPTY_GRID);
  const [billingItemRowData, setBillingItemRowData] = useState<any[]>([]);
  const [orderInfoRowData, setOrderInfoRowData] = useState<any[]>([]);
  const [attachmentRowData, setAttachmentRowData] = useState<any[]>([]);

  const [selectedHeaderRow, setSelectedHeaderRow] = useState<any>(null);
  const selectedHeaderRowRef = useRef<any>(null);
  const setSelectedHeaderRowWithRef = useCallback((row: any) => {
    setSelectedHeaderRow(row);
    selectedHeaderRowRef.current = row;
  }, []);

  const resetSubGrids = useCallback(() => {
    setSelectedHeaderRowWithRef(null);
    setBillingItemRowData([]);
    setOrderInfoRowData([]);
    setAttachmentRowData([]);
  }, [setSelectedHeaderRowWithRef]);

  const { stores } = useCommonStores({
    prgsStsList: { sqlProp: "CODE", keyParam: "PRGS_STS" },
    arCalcTpList: { sqlProp: "CODE", keyParam: "AR_CALC_TP_CD" },
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
    billingItemRowData,
    setBillingItemRowData,
    orderInfoRowData,
    setOrderInfoRowData,
    attachmentRowData,
    setAttachmentRowData,
    selectedHeaderRow,
    selectedHeaderRowRef,
    setSelectedHeaderRow: setSelectedHeaderRowWithRef,
    resetSubGrids,
    codeMap,
  };
}

export type OperatorArBillingInquiryModel = ReturnType<
  typeof useOperatorArBillingInquiryModel
>;
