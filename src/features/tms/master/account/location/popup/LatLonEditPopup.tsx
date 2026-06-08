"use client";
// 위경도 수정 팝업 (센차 PopMap/LocationPopMap 대응).
//   - 지도 클릭 → 마커 이동 + 위경도 갱신
//   - 상세주소(addr1/2) 직접 입력
//   - 적용 → { LAT, LON, DTL_ADDR1, DTL_ADDR2 } 를 onApply 로 반환 (호출측이 메인행 갱신)
//   ※ 주소→좌표 지오코딩 버튼은 서버 지오코딩 API 연동 후 추가 예정.

import { useMemo, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  TmapView,
  type TmapMarker,
  type TmapViewHandle,
} from "@/app/components/map/TmapView";
import { Lang } from "@/app/services/common/Lang";
import {
  PopupSearchCondition,
  type GridSearchField,
} from "@/app/components/popup/PopupSearchCondition";

type Props = {
  row: any;
  onApply: (patch: {
    LAT: number;
    LON: number;
    DTL_ADDR1: string;
    DTL_ADDR2: string;
  }) => void;
  onClose: () => void;
};

const toNum = (v: any): number | null => {
  const n = Number(v);
  return Number.isFinite(n) && (n !== 0 || v === 0 || v === "0") ? n : null;
};

export default function LatLonEditPopup({ row, onApply, onClose }: Props) {
  const mapRef = useRef<TmapViewHandle>(null);
  const [lat, setLat] = useState<string>(String(row?.LAT ?? ""));
  const [lon, setLon] = useState<string>(String(row?.LON ?? ""));
  const [addr1, setAddr1] = useState<string>(String(row?.DTL_ADDR1 ?? ""));
  const [addr2, setAddr2] = useState<string>(String(row?.DTL_ADDR2 ?? ""));

  const latN = toNum(lat);
  const lonN = toNum(lon);

  const markers = useMemo<TmapMarker[]>(
    () =>
      latN != null && lonN != null
        ? [
            {
              id: String(row?.LOC_ID ?? "loc"),
              lat: latN,
              lon: lonN,
              label: row?.LOC_NM,
            },
          ]
        : [],
    [latN, lonN, row],
  );

  const center =
    latN != null && lonN != null ? { lat: latN, lon: lonN } : undefined;

  const onMapClick = (clickLat: number, clickLon: number) => {
    setLat(clickLat.toFixed(7));
    setLon(clickLon.toFixed(7));
    mapRef.current?.panTo(clickLat, clickLon);
  };

  const apply = () => {
    onApply({
      LAT: Number.parseFloat(lat),
      LON: Number.parseFloat(lon),
      DTL_ADDR1: addr1,
      DTL_ADDR2: addr2,
    });
  };

  // 입력된 위경도로 지도 이동 (지오코딩 API 연동 전까지는 좌표 기준 재조회)
  const onSearchCoord = () => {
    if (latN != null && lonN != null) mapRef.current?.panTo(latN, lonN);
  };

  const searchFields: GridSearchField[] = [
    {
      label: Lang.get("LBL_ADDR"),
      value: addr1,
      onChange: setAddr1,
      disable: true,
    },
    {
      label: Lang.get("LBL_DETAIL_ADDRESS2"),
      value: addr2,
      onChange: setAddr2,
      disable: true,
    },
    {
      label: Lang.get("LBL_LATITUDE"),
      value: lat,
      onChange: setLat,
      disable: true,
    },
    {
      label: Lang.get("LBL_LONGITUDE"),
      value: lon,
      onChange: setLon,
      disable: true,
    },
  ];

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 조회조건 — 공통 컴포넌트 */}
      <PopupSearchCondition
        fields={searchFields}
        onSearch={onSearchCoord}
        columns={2}
        searchBtnDisable={true}
      />
      <div style={{ height: 460 }}>
        <TmapView
          ref={mapRef}
          markers={markers}
          center={center}
          onMapClick={onMapClick}
          onReady={() => mapRef.current?.fitMarkers()}
        />
      </div>

      <div className="flex justify-end gap-1.5 pt-2.5 border-t">
        <Button variant="outline" size="xs" onClick={onClose}>
          <X className="w-3 h-3" />
          {Lang.get("BTN_CANCEL")}
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={apply}
          className="btn-primary btn-primary:hover"
        >
          <Check className="w-3 h-3" />
          {Lang.get("BTN_APPLY")}
        </Button>
      </div>
    </div>
  );
}
