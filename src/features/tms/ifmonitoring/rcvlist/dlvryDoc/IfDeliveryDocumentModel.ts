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

export function useIfDeliveryDocumentModel() {
  const [layout, setLayout] = useState<LayoutType>("vertical");
  const [pageSize, setPageSize] = useState(500);

  const [gridData, setGridData] = useState<GridData>(EMPTY_GRID);
  const [detailRowData, setDetailRowData] = useState<any[]>([]);

  const [selectedHeaderRow, setSelectedHeaderRow] = useState<any>(null);
  const selectedHeaderRowRef = useRef<any>(null);
  const setSelectedHeaderRowWithRef = useCallback((row: any) => {
    setSelectedHeaderRow(row);
    selectedHeaderRowRef.current = row;
  }, []);

  const resetSubGrids = useCallback(() => {
    setSelectedHeaderRowWithRef(null);
    setDetailRowData([]);
  }, [setSelectedHeaderRowWithRef]);

  const { stores } = useCommonStores({
    interfaceType: { sqlProp: "CODE", keyParam: "IF_TCD" },
    interfaceStatus: { sqlProp: "CODE", keyParam: "IF_PRCS_STS" },
    vehicleTransType: { sqlProp: "CODE", keyParam: "TRANS_TCD" },
    weightType: { sqlProp: "CODE", keyParam: "WGT_TP" },
    itemTypeCode: { sqlProp: "CODE", keyParam: "ITEM_TCD" },
    temporatureTypeCode: { sqlProp: "CODE", keyParam: "ITEM_TCD" },
    itemUom: { sqlProp: "CODE", keyParam: "ITEM_UOM" },
    interfaceMessage: { sqlProp: "CODE", keyParam: "IF_PRCS_MSG_CD" },
    ordCreFlag: { sqlProp: "CODE", keyParam: "HARIM_ORD_CRE_TP_CD" },
    dlvryTp: { sqlProp: "CODE", keyParam: "HARIM_ORD_DLV_TP_CD" },
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
    detailRowData,
    setDetailRowData,
    selectedHeaderRow,
    selectedHeaderRowRef,
    setSelectedHeaderRow: setSelectedHeaderRowWithRef,
    resetSubGrids,
    codeMap,
  };
}

export type IfDeliveryDocumentModel = ReturnType<
  typeof useIfDeliveryDocumentModel
>;
