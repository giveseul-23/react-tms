// src/views/drvhstry/DriveHistory.tsx
"use client";

import { useMemo } from "react";
import { GridMapPage } from "@/app/components/layout/presets/GridMapPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { TmapView, TmapMarker } from "@/app/components/map/TmapView";

import { useDriveHistoryModel } from "./DriveHistoryModel";
import { useDriveHistoryController } from "./DriveHistoryController";
import { MAIN_COLUMN_DEFS } from "./DriveHistoryColumns";

export const MENU_CODE = "MENU_DRIVE_HISTORY";

export default function DriveHistory() {
  const model = useDriveHistoryModel(MENU_CODE);
  const ctrl = useDriveHistoryController({ model });

  const markers = useMemo<TmapMarker[]>(() => {
    return (model.grids.main.rows ?? [])
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
  }, [model.grids.main.rows, ctrl]);

  const gridPane = (
    <DataGrid
      {...model.bind("main")}
      columnDefs={MAIN_COLUMN_DEFS()}
      onRowClicked={ctrl.handleRowClicked}
      codeMap={model.codeMap}
      audit={false}
    />
  );

  const mapPane = (
    <div className="h-full w-full min-h-0 min-w-0 border border-gray-200 rounded-lg overflow-hidden bg-white">
      <TmapView ref={model.mapRef} markers={markers} />
    </div>
  );

  return (
    <GridMapPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchInTrnstVehList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
        menuCode: MENU_CODE,
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
      storageKey={model.storageKeys.outer}
      grid={gridPane}
      map={mapPane}
    />
  );
}
