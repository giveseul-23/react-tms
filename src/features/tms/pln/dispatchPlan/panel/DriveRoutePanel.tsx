// 경로보기 SidePanel 본문 — 선택 배차행의 DSPCH_NO 로 주행경로(trace)+정차지(route)를 Tmap 지도에 표시.
// 운행이력(DriveHistory) 의 지도 패널 그리기 로직을 재사용한다.

"use client";

import { useEffect, useRef, useState } from "react";
import {
  TmapView,
  TmapViewHandle,
  StopMarker,
} from "@/app/components/map/TmapView";
import { dispatchPlanApi as api } from "../dispatchPlanApi";

type Props = {
  /** 선택된 배차행 (= model.grids.main.selected). 바뀌면 재조회. */
  row: any;
};

const extractRows = (res: any): any[] =>
  res?.data?.result ?? res?.data?.data?.dsOut ?? res?.data?.data ?? [];

export default function DriveRoutePanel({ row }: Props) {
  const mapRef = useRef<TmapViewHandle | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dspchNo = row?.DSPCH_NO;

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;

    map.clearTrace();
    map.clearStopMarkers();
    setError(null);

    if (!dspchNo) return;

    let cancelled = false;
    Promise.all([
      api.searchDispathTrace(String(dspchNo)),
      api.getDlvryRoute(String(dspchNo)),
    ])
      .then(([traceRes, routeRes]: any[]) => {
        if (cancelled) return;
        if (traceRes?.data?.success === false) {
          setError(traceRes.data.msg ?? "주행경로 조회 실패");
          return;
        }
        if (routeRes?.data?.success === false) {
          setError(routeRes.data.msg ?? "정차지 조회 실패");
          return;
        }

        const tracePoints = extractRows(traceRes).map((r: any) => ({
          lat: Number(r.LAT),
          lon: Number(r.LON),
        }));
        map.drawTrace(tracePoints);

        const routeRows = extractRows(routeRes);
        const stops: StopMarker[] = routeRows.map((r: any, i: number) => {
          let kind: "start" | "end" | "via";
          if (i === 0) kind = "start";
          else if (i === routeRows.length - 1) kind = "end";
          else kind = "via";
          return {
            id: `stop-${i}`,
            lat: Number(r.LAT),
            lon: Number(r.LON),
            label: r.LOC_NM ?? "",
            kind,
          };
        });
        map.drawStopMarkers(stops);
        map.fitAll();
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(
          err?.response?.data?.error?.message ??
            err?.response?.data?.msg ??
            String(err?.message ?? err),
        );
      });

    return () => {
      cancelled = true;
    };
  }, [mapReady, dspchNo]);

  if (!dspchNo) {
    return (
      <div className="h-full w-full flex items-center justify-center text-[12px] text-slate-400">
        배차를 선택하세요.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full min-h-0 min-w-0 border border-gray-200 rounded-lg overflow-hidden bg-white">
      <TmapView ref={mapRef} markers={[]} onReady={() => setMapReady(true)} />
      {error && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-md bg-red-50 border border-red-200 text-[11px] text-red-600 shadow-sm">
          {error}
        </div>
      )}
    </div>
  );
}
