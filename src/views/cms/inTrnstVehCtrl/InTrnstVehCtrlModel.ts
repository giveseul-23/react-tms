// src/views/inTrnstVehCtrl/InTrnstVehCtrlModel.ts
import { useState, useRef } from "react";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import type { TmapViewHandle } from "@/app/components/map/TmapView";

export type GridData = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

export function useInTrnstVehCtrlModel() {
  // 레이아웃: 지도는 좌/우 배치가 자연스러우므로 기본 side
  const [layout, setLayout] = useState<LayoutType>("side");

  const [pageSize, setPageSize] = useState(50);

  const [gridData, setGridData] = useState<GridData>({
    rows: [],
    totalCount: 0,
    page: 1,
    limit: 50,
  });

  const [selectedRow, setSelectedRow] = useState<any>(null);

  const mapRef = useRef<TmapViewHandle | null>(null);

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
  };
}

export type InTrnstVehCtrlModel = ReturnType<typeof useInTrnstVehCtrlModel>;
