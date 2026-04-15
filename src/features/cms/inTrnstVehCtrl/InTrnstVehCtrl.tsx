// src/views/inTrnstVehCtrl/InTrnstVehCtrl.tsx
// ────────────────────────────────────────────────────────────────
// 수송중 차량제어 (MENU_IN_TRNST_VEH_CTRL)
//
// 레이아웃:
//   [SearchFilters]
//   ┌──────────── 좌/우 분할 (PanelGroup horizontal, 드래그 리사이즈) ────────────┐
//   │   좌: 차량 목록 DataGrid          │   우: TMAP 지도 + 차량 마커            │
//   └──────────────────────────────────────────────────────────────────────────┘
// ────────────────────────────────────────────────────────────────
"use client";

import { useRef, useMemo } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { GridMapPage } from "@/app/components/layout/presets/GridMapPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";
import { TmapView, TmapMarker } from "@/app/components/map/TmapView";

import { useInTrnstVehCtrlModel } from "./InTrnstVehCtrlModel";
import { useInTrnstVehCtrlController } from "./InTrnstVehCtrlController";
import { MAIN_COLUMN_DEFS } from "./InTrnstVehCtrlColumns";

const MENU_CODE = "MENU_IN_TRNST_VEH_CTRL";

export default function InTrnstVehCtrl() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useInTrnstVehCtrlModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});

  const ctrl = useInTrnstVehCtrlController({ model, searchRef, filtersRef });

  // ── 그리드 행 → 지도 마커 변환 ──────────────────────────────
  const markers = useMemo<TmapMarker[]>(() => {
    return (model.gridData.rows ?? [])
      .map((row: any) => {
        const lat = Number(row.LAT);
        const lon = Number(row.LON);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
        if (lat === 0 && lon === 0) return null;
        return {
          id: String(row.DSPCH_NO ?? row.VEH_NO ?? `${lat},${lon}`),
          lat,
          lon,
          label: row.VEH_NO ?? "",
          tooltip: row.DRVR_NM ?? row.VEH_NO ?? "",
          onClick: () => ctrl.handleRowClicked(row),
        } as TmapMarker;
      })
      .filter((m: TmapMarker | null): m is TmapMarker => m !== null);
  }, [model.gridData.rows, ctrl]);

  if (loading) return <Skeleton className="h-24" />;

  // ── 좌측: 그리드 ────────────────────────────────────────────
  const gridPane = (
    <DataGrid
      layoutType="plain"
      columnDefs={MAIN_COLUMN_DEFS()}
      rowData={model.gridData.rows}
      totalCount={model.gridData.totalCount}
      currentPage={model.gridData.page}
      pageSize={model.pageSize}
      onPageSizeChange={model.setPageSize}
      onPageChange={(page) => searchRef.current?.(page, false)}
      actions={ctrl.mainActions}
      onRowClicked={ctrl.handleRowClicked}
    />
  );

  // ── 우측: TMAP ──────────────────────────────────────────────
  const mapPane = (
    <div className="h-full w-full min-h-0 min-w-0 border border-gray-200 rounded-lg overflow-hidden bg-white">
      <TmapView ref={model.mapRef} markers={markers} />
    </div>
  );

  return (
    <GridMapPage
      searchProps={{
        meta,
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchInTrnstVehList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        pageSize: model.pageSize,
      }}
      direction={model.layout === "side" ? "horizontal" : "vertical"}
      defaultSizes={[45, 55]}
      layoutToggle={{
        layout: model.layout,
        onToggle: () =>
          model.setLayout((prev: LayoutType) =>
            prev === "side" ? "vertical" : "side",
          ),
      }}
      storageKey="in-trnst-veh-ctrl"
      grid={gridPane}
      map={mapPane}
    />
  );
}
