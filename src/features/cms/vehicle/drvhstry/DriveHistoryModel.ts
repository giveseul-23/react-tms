// src/views/inTrnstVehCtrl/InTrnstVehCtrlModel.ts
import { useState, useRef, useMemo } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import type { TmapViewHandle } from "@/app/components/map/TmapView";

export type GridData = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

export function useDriveHistoryModel() {
  // 레이아웃: 지도는 좌/우 배치가 자연스러우므로 기본 side
  const [layout, setLayout] = useState<LayoutType>("side");

  const [pageSize, setPageSize] = useState(500);

  const [gridData, setGridData] = useState<GridData>({
    rows: [],
    totalCount: 0,
    page: 1,
    limit: 50,
  });

  const [selectedRow, setSelectedRow] = useState<any>(null);

  const mapRef = useRef<TmapViewHandle | null>(null);

  // ── 공통 코드 스토어 (조회조건 콤보 옵션)
  const { stores } = useCommonStores({
    vehOpTypeList: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
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
    selectedRow,
    setSelectedRow,
    mapRef,
    stores,
    codeMap,
  };
}

export type DriveHistoryModel = ReturnType<typeof useDriveHistoryModel>;
