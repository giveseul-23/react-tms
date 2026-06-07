// src/views/inTrnstVehCtrl/InTrnstVehCtrl.tsx
"use client";

import { useMemo } from "react";
import { GridMapPage } from "@/app/components/layout/presets/GridMapPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { TmapView, TmapMarker } from "@/app/components/map/TmapView";

import { useInTrnstVehCtrlModel } from "./InTrnstVehCtrlModel";
import { useInTrnstVehCtrlController } from "./InTrnstVehCtrlController";
import { MAIN_COLUMN_DEFS } from "./InTrnstVehCtrlColumns";

export const MENU_CODE = "MENU_IN_TRNST_VEH_CTRL";

export default function InTrnstVehCtrl() {
  const model = useInTrnstVehCtrlModel(MENU_CODE);
  const ctrl = useInTrnstVehCtrlController({ model });

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
        ...model.bindSearch(),
      }}
      defaultDirection={"horizontal"}
      defaultSizes={[45, 55]}
      storageKey={model.storageKeys.outer}
      grid={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.handleRowClicked}
          codeMap={model.codeMap}
          audit={{
            delete: false,
            rowStatus: false,
            insertPerson: false,
            insertDate: false,
            updatePerson: false,
            updateTime: true,
          }}
        />
      }
      map={mapPane}
    />
  );
}
