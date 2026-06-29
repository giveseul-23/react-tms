"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  TmapView,
  type TmapViewHandle,
  type TracePoint,
} from "@/app/components/map/TmapView";
import { Lang } from "@/app/services/common/Lang";
import { departArrivalManagementApi as api } from "../DepartArrivalManagementApi";

type Props = {
  row: any;
};

const getRows = (res: any): any[] =>
  res?.data?.data?.dsOut ?? res?.data?.result ?? res?.data?.data ?? [];

const toNumber = (value: any) => Number(value);

type RouteStop = TracePoint & {
  id: string;
  label: string;
  kind: "start" | "end" | "via";
  sequence: number;
};

const isValidPoint = (point: TracePoint) =>
  Number.isFinite(point.lat) &&
  Number.isFinite(point.lon) &&
  Math.abs(point.lat) <= 90 &&
  Math.abs(point.lon) <= 180 &&
  !(point.lat === 0 && point.lon === 0);

const toStops = (rows: any[]): RouteStop[] =>
  rows.map((row, index) => {
    let kind: "start" | "end" | "via" = "via";
    if (index === 0) kind = "start";
    else if (index === rows.length - 1) kind = "end";

    return {
      id: `stop-${row.STOP_ID ?? row.LOC_ID ?? index}`,
      lat: toNumber(row.LAT),
      lon: toNumber(row.LON),
      label: row.LOC_NM ?? row.LOC_CD ?? "",
      kind,
      sequence: index,
    };
  });

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stopBadge = (stop: RouteStop) => {
  if (stop.kind === "start") return Lang.get("LBL_DEPARTURE");
  if (stop.kind === "end") return Lang.get("LBL_DESTINATION_EX");
  return String(stop.sequence);
};

export default function DriveHistoryPopup({ row }: Props) {
  const mapRef = useRef<TmapViewHandle | null>(null);
  const routeMarkersRef = useRef<any[]>([]);
  const [error, setError] = useState("");
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [isStopListExpanded, setIsStopListExpanded] = useState(true);

  const clearRouteMarkers = useCallback(() => {
    routeMarkersRef.current.forEach((marker) => marker.setMap(null));
    routeMarkersRef.current = [];
  }, []);

  const drawRouteMarkers = useCallback(
    (stops: RouteStop[]) => {
      clearRouteMarkers();

      const map = mapRef.current?.getMap();
      const Tmapv2 = window.Tmapv2;
      if (!map || !Tmapv2) return;

      routeMarkersRef.current = stops.filter(isValidPoint).map((stop) => {
        const isStart = stop.kind === "start";
        const isEnd = stop.kind === "end";
        const color = isStart ? "#16a34a" : isEnd ? "#dc2626" : "#eab308";
        const text = escapeHtml(stopBadge(stop));

        return new Tmapv2.Marker({
          position: new Tmapv2.LatLng(stop.lat, stop.lon),
          map,
          title: stop.label,
          label: `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:28px;height:28px;border-radius:9999px;background:${color};border:2px solid #ffffff;color:#ffffff;font-size:11px;font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,.35);">${text}</span>`,
        });
      });
    },
    [clearRouteMarkers],
  );

  const fitPoints = useCallback((points: TracePoint[]) => {
    const map = mapRef.current?.getMap();
    const Tmapv2 = window.Tmapv2;
    const valid = points.filter(isValidPoint);
    if (!map || !Tmapv2 || valid.length === 0) return;

    if (valid.length === 1) {
      map.setCenter(new Tmapv2.LatLng(valid[0].lat, valid[0].lon));
      return;
    }

    const bounds = new Tmapv2.LatLngBounds();
    valid.forEach((point) =>
      bounds.extend(new Tmapv2.LatLng(point.lat, point.lon)),
    );
    map.fitBounds(bounds, 100);
  }, []);

  const handleStopListWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.scrollTop += event.deltaY;
    },
    [],
  );

  const draw = useCallback(async () => {
    const dspchNo = row?.DSPCH_NO;
    if (!dspchNo || !mapRef.current) return;

    setError("");
    setRouteStops([]);
    clearRouteMarkers();
    mapRef.current.clearTrace();
    mapRef.current.clearStopMarkers();

    try {
      const [traceRes, routeRes] = await Promise.all([
        api.searchDispatchTrace({ DSPCH_NO: dspchNo }),
        api.getDlvryRoute({ DSPCH_NO: dspchNo }),
      ]);

      if (traceRes?.data?.success === false) {
        setError(traceRes.data.msg ?? Lang.get("MSG_FAIL"));
        return;
      }
      if (routeRes?.data?.success === false) {
        setError(routeRes.data.msg ?? Lang.get("MSG_FAIL"));
        return;
      }

      const tracePoints = getRows(traceRes).map((item) => ({
        lat: toNumber(item.LAT),
        lon: toNumber(item.LON),
      }));
      const routeStops = toStops(getRows(routeRes));

      mapRef.current.drawTrace(tracePoints);
      setRouteStops(routeStops);
      setIsStopListExpanded(routeStops.length < 5);
      drawRouteMarkers(routeStops);
      fitPoints([
        ...tracePoints,
        ...routeStops.map((stop) => ({ lat: stop.lat, lon: stop.lon })),
      ]);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ??
          err?.response?.data?.msg ??
          String(err?.message ?? err),
      );
    }
  }, [clearRouteMarkers, drawRouteMarkers, fitPoints, row]);

  useEffect(
    () => () => {
      clearRouteMarkers();
    },
    [clearRouteMarkers],
  );

  return (
    <div className="relative h-[620px] min-h-0 w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
      <TmapView ref={mapRef} onReady={() => void draw()} />
      {routeStops.length > 0 && (
        <div
          className="absolute left-3 top-3 z-10 flex max-h-[calc(100%-24px)] w-[300px] flex-col rounded-lg bg-white shadow-lg"
          onMouseDown={(event) => event.stopPropagation()}
          onWheel={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="flex h-12 shrink-0 items-center justify-between border-b border-gray-100 px-4 text-left"
            onClick={() => setIsStopListExpanded((value) => !value)}
            aria-expanded={isStopListExpanded}
          >
            <span className="text-sm font-semibold text-gray-900">
              정차지 {routeStops.length.toLocaleString()}개
            </span>
            <span className="text-xs font-semibold text-gray-500">
              {isStopListExpanded ? "▲" : "▼"}
            </span>
          </button>
          {isStopListExpanded && (
            <div
              className="min-h-0 flex-1 overflow-y-auto px-4 py-2"
              onWheelCapture={handleStopListWheel}
              style={{
                scrollbarWidth: "thin",
                scrollbarGutter: "stable",
                overscrollBehavior: "contain",
              }}
            >
              {routeStops.map((stop) => {
                const isStart = stop.kind === "start";
                const isEnd = stop.kind === "end";
                const color = isStart
                  ? "border-green-600 text-green-700"
                  : isEnd
                    ? "border-red-600 text-red-700"
                    : "border-amber-500 text-amber-600";

                return (
                  <div
                    key={stop.id}
                    className="flex min-h-10 items-center gap-3 py-1.5 text-xs text-gray-700"
                    title={stop.label}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-white text-[11px] font-semibold ${color}`}
                    >
                      {stopBadge(stop)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {stop.label || "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {error && (
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-700 shadow-sm">
          {error}
        </div>
      )}
    </div>
  );
}

