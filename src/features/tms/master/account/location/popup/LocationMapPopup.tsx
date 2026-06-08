"use client";
// 착지 지도보기 팝업 (센차 PopMap/LocationPopMarkerMap 대응 — 조회 전용).
//   - 선택한 착지들의 LAT/LON 에 마커 표시. 좌표 없는 행은 제외.

import { useMemo, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import { X } from "lucide-react";
import {
  TmapView,
  type TmapMarker,
  type TmapViewHandle,
} from "@/app/components/map/TmapView";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  locRows: any[];
  onClose: () => void;
};

export default function LocationMapPopup({ locRows, onClose }: Props) {
  const mapRef = useRef<TmapViewHandle>(null);

  const markers = useMemo<TmapMarker[]>(
    () =>
      (locRows ?? [])
        .map((r) => ({
          id: String(r.LOC_ID ?? r.LOC_CD ?? ""),
          lat: Number(r.LAT),
          lon: Number(r.LON),
          label: r.LOC_NM,
          tooltip: r.LOC_CD,
        }))
        .filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lon) && (m.lat !== 0 || m.lon !== 0)),
    [locRows],
  );

  const center = markers[0]
    ? { lat: markers[0].lat, lon: markers[0].lon }
    : undefined;

  return (
    <div className="flex flex-col gap-3 w-full">
      <div style={{ height: 560 }}>
        {markers.length > 0 ? (
          <TmapView
            ref={mapRef}
            markers={markers}
            center={center}
            onReady={() => mapRef.current?.fitMarkers()}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            {Lang.get("MSG_SELECT_NO_DATA")}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-1.5 pt-2.5 border-t">
        <Button variant="outline" size="xs" onClick={onClose}>
          <X className="w-3 h-3" />
          {Lang.get("BTN_CANCEL")}
        </Button>
      </div>
    </div>
  );
}
