// src/views/vehicleMgmt/VehicleMgmtModel.ts
import { useState, useRef, useCallback, useMemo } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";

// 운영상태 컬러맵
export const VEH_OP_STS_COLOR_MAP: Record<string, string> = {
  "100": "bg-emerald-100 text-emerald-700", // 운영중
  "200": "bg-amber-100 text-amber-700",     // 휴차
  "300": "bg-red-100 text-red-700",         // 폐차
};

export type GridData = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

export type DetailMode = "view" | "edit" | "new";

export function useVehicleMgmtModel() {
  // ── 페이징 ───────────────────────────────────────────────────
  const [pageSize, setPageSize] = useState(20);

  // ── 메인 그리드 데이터 ───────────────────────────────────────
  const [gridData, setGridData] = useState<GridData>({
    rows: [],
    totalCount: 0,
    page: 1,
    limit: 20,
  });

  // ── 선택 행 ──────────────────────────────────────────────────
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const selectedRowRef = useRef<any>(null);

  const setSelectedRowWithRef = useCallback((row: any) => {
    setSelectedRow(row);
    selectedRowRef.current = row;
  }, []);

  // ── 상세 패널 ────────────────────────────────────────────────
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailMode, setDetailMode] = useState<DetailMode>("view");
  const [detailData, setDetailData] = useState<any>({});

  // ── 상세 패널 네비게이션 인덱스 ──────────────────────────────
  const [detailIndex, setDetailIndex] = useState(-1);

  // ── 네비게이션 로딩 ──────────────────────────────────────────
  const [navigating, setNavigating] = useState(false);

  // ── 신규 등록 슬라이드 오버레이 ──────────────────────────────
  const [newSlideOpen, setNewSlideOpen] = useState(false);
  const [newFormData, setNewFormData] = useState<any>({});

  // ── 상세 패널 닫기 ───────────────────────────────────────────
  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    setSelectedRowWithRef(null);
    setDetailIndex(-1);
  }, [setSelectedRowWithRef]);

  // ── 공통 코드 스토어 ─────────────────────────────────────────
  const { stores } = useCommonStores({
    vehOpSts: { sqlProp: "CODE", keyParam: "VEH_OP_STS" },
    setlTp: { sqlProp: "CODE", keyParam: "SETL_TP" },
    dlvryTp: { sqlProp: "CODE", keyParam: "DLVRY_TP" },
  });

  // 코드 → 명칭 변환맵
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
    // paging
    pageSize,
    setPageSize,
    // main grid
    gridData,
    setGridData,
    // selected row
    selectedRow,
    setSelectedRow: setSelectedRowWithRef,
    selectedRowRef,
    // detail panel
    detailOpen,
    setDetailOpen,
    detailMode,
    setDetailMode,
    detailData,
    setDetailData,
    detailIndex,
    setDetailIndex,
    navigating,
    setNavigating,
    closeDetail,
    // new slide
    newSlideOpen,
    setNewSlideOpen,
    newFormData,
    setNewFormData,
    // code maps
    codeMap,
    stores,
  };
}

export type VehicleMgmtModel = ReturnType<typeof useVehicleMgmtModel>;
