"use client";

// 차량위치(GPS) 조회 공통 컴포넌트 — Tmap 지도에 선택 차량들의 현재 위치를 마커로 표시.
//  · 패널/팝업 양쪽 사용: onClose 가 있으면 팝업 모드(높이 + 닫기 버튼), 없으면 패널 모드(부모 높이 채움).
//  · 위치 조회 방식은 화면마다 다르므로 fetchPositions 로 주입(차량ID 배열 → 위치행 배열).
//    위치행은 LAT/LON(+VEH_NO/DRVR_NM) 키를 가진다.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  TmapView,
  TmapMarker,
  TmapViewHandle,
} from "@/app/components/map/TmapView";
import { Button } from "@/app/components/ui/button";

type Props = {
  /** 조회 대상 차량 ID 목록 (변경되면 재조회) */
  vehIds: string[];
  /** 차량 ID 배열을 받아 위치행 배열을 반환 (화면별 API 주입) */
  fetchPositions: (vehIds: string[]) => Promise<any[]>;
  /** 지정 시 팝업 모드 — 높이 + 하단 닫기 버튼 렌더 */
  onClose?: () => void;
  /** 팝업 모드 높이 (기본 "60vh"). 패널 모드는 부모 높이를 채움 */
  height?: number | string;
  /** 선택 차량 없을 때 안내 문구 */
  emptyText?: string;
};

export default function VehicleLocationView({
  vehIds,
  fetchPositions,
  onClose,
  height = "60vh",
  emptyText = "차량을 선택하세요.",
}: Props) {
  const mapRef = useRef<TmapViewHandle | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  // 지도 SDK 로드 완료 여부 — 로드 전 fitMarkers 는 no-op 이므로 준비 후 재-fit 필요
  const [mapReady, setMapReady] = useState(false);

  const ids = useMemo(
    () =>
      Array.from(
        new Set((vehIds ?? []).filter(Boolean).map(String)),
      ),
    [vehIds],
  );
  const idKey = ids.join(",");

  useEffect(() => {
    if (ids.length === 0) {
      setRows([]);
      return;
    }
    let cancelled = false;
    fetchPositions(ids)
      .then((list) => {
        if (!cancelled) setRows(list ?? []);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idKey]);

  const markers = useMemo<TmapMarker[]>(
    () =>
      rows
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
        .filter((m: TmapMarker | null): m is TmapMarker => m !== null),
    [rows],
  );

  // 지도 준비 완료(mapReady) + 마커 존재 시 fit. markers 변경 시에도 재실행.
  //  (지도 로드 전 도착한 마커는 fitMarkers no-op 이므로 mapReady 를 트리거에 포함)
  useEffect(() => {
    if (!mapReady || markers.length === 0) return;
    requestAnimationFrame(() => mapRef.current?.fitMarkers());
  }, [mapReady, markers]);

  const mapNode =
    ids.length === 0 ? (
      <div className="h-full w-full flex items-center justify-center text-[12px] text-slate-400">
        {emptyText}
      </div>
    ) : (
      <div className="h-full w-full min-h-0 min-w-0 border border-gray-200 rounded-lg overflow-hidden bg-white">
        <TmapView
          ref={mapRef}
          markers={markers}
          onReady={() => setMapReady(true)}
        />
      </div>
    );

  // 팝업 모드 — 높이 + 하단 닫기
  if (onClose) {
    return (
      <div className="flex flex-col gap-2 w-full" style={{ height }}>
        <div className="flex-1 min-h-0">{mapNode}</div>
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="h-7 px-4 text-xs"
          >
            닫기
          </Button>
        </div>
      </div>
    );
  }

  // 패널 모드 — 부모 높이 채움
  return <div className="h-full w-full min-h-0">{mapNode}</div>;
}
