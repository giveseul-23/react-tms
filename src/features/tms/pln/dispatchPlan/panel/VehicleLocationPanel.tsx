// 차량위치보기 SidePanel 본문 — 선택 배차행의 VEH_ID 로 현재 위치를 조회해 Tmap 지도에 표시.
// 수송중차량관제(InTrnstVehCtrl) 의 지도 패널 부분을 재사용한다.

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  TmapView,
  TmapMarker,
  TmapViewHandle,
} from "@/app/components/map/TmapView";
import { dispatchPlanApi as api } from "../dispatchPlanApi";

type Props = {
  /** 선택된 배차행들 (= model.vehLocRows). 바뀌면 각 차량 위치를 모두 재조회. */
  rows: any[];
};

export default function VehicleLocationPanel({ rows: selRows }: Props) {
  const mapRef = useRef<TmapViewHandle | null>(null);
  const [rows, setRows] = useState<any[]>([]);

  // 선택행들의 고유 VEH_ID 목록
  const vehIds = useMemo(
    () =>
      Array.from(
        new Set(
          (selRows ?? [])
            .map((r: any) => r?.VEH_ID)
            .filter(Boolean)
            .map(String),
        ),
      ),
    [selRows],
  );
  const vehKey = vehIds.join(",");

  useEffect(() => {
    if (vehIds.length === 0) {
      setRows([]);
      return;
    }
    let cancelled = false;
    Promise.all(
      vehIds.map((id) =>
        api
          .getVehiclePosition(id)
          .then(
            (res: any) => res.data?.result ?? res.data?.data?.dsOut ?? [],
          )
          .catch(() => []),
      ),
    ).then((lists) => {
      if (!cancelled) setRows(lists.flat());
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehKey]);

  const markers = useMemo<TmapMarker[]>(() => {
    return rows
      .map((r: any) => {
        const lat = Number(r.LAT);
        const lon = Number(r.LON);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
        if (lat === 0 && lon === 0) return null;
        return {
          id: String(r.VEH_ID ?? r.VEH_NO ?? `${lat},${lon}`),
          lat,
          lon,
          label: r.VEH_NO ?? "",
          tooltip: r.DRVR_NM ?? r.VEH_NO ?? "",
        } as TmapMarker;
      })
      .filter((m: TmapMarker | null): m is TmapMarker => m !== null);
  }, [rows]);

  // 마커가 갱신되면 해당 위치로 영역 맞춤
  useEffect(() => {
    if (markers.length === 0) return;
    requestAnimationFrame(() => mapRef.current?.fitMarkers());
  }, [markers]);

  if (vehIds.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-[12px] text-slate-400">
        배차를 선택하세요.
      </div>
    );
  }

  return (
    <div className="h-full w-full min-h-0 min-w-0 border border-gray-200 rounded-lg overflow-hidden bg-white">
      <TmapView ref={mapRef} markers={markers} />
    </div>
  );
}
