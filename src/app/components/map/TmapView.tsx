// src/app/components/map/TmapView.tsx
//
// TMAP v2 SDK 를 동적으로 로드하여 지도를 표시하는 공통 컴포넌트.
// - 스크립트는 최초 1회만 로드하고 이후 인스턴스 간 공유한다
// - 컨테이너 크기 변화에 따라 지도 리사이즈를 수행 (split pane 대응)
// - markers prop 으로 핀을 선언적으로 관리

"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

declare global {
  interface Window {
    Tmapv2: any;
  }
}

export type TmapMarker = {
  id: string;
  lat: number;
  lon: number;
  /** 마커 아래 배지 형태로 표시되는 라벨 (예: 차량번호) */
  label?: string;
  /** 마우스 hover 시 툴팁 (예: 운전자명) */
  tooltip?: string;
  iconUrl?: string;
  onClick?: () => void;
};

export type TracePoint = { lat: number; lon: number };

export type StopMarker = {
  id: string;
  lat: number;
  lon: number;
  /** 핀 옆 라벨 (예: "출발", "1", "도착") */
  label?: string;
  /** hover 시 툴팁 */
  title?: string;
  /** 핀 종류 — start:초록 / end:빨강 / via:노랑 / undefined=Tmap 기본 */
  kind?: "start" | "end" | "via";
};

export type TmapViewHandle = {
  /** 특정 좌표로 지도 중심 이동 */
  panTo: (lat: number, lon: number, zoom?: number) => void;
  /** 모든 마커가 보이도록 영역 맞춤 */
  fitMarkers: () => void;
  /** 원본 map 객체 접근 */
  getMap: () => any | null;
  // ── 공통 trace API (legacy AbstractMap/TMap 대응) ────────────
  /** Polyline(주행경로) 그리기 — 기존 trace 는 교체 */
  drawTrace: (points: TracePoint[], options?: TraceOptions) => void;
  /** drawTrace 로 그린 Polyline 제거 */
  clearTrace: () => void;
  /** trace 포인트 bounds 로 zoom */
  fitTrace: () => void;
  /** 정차지(출발/경유/도착) 핀 그리기 — 기존 stop 은 교체 */
  drawStopMarkers: (stops: StopMarker[]) => void;
  /** drawStopMarkers 로 그린 핀 제거 */
  clearStopMarkers: () => void;
  /** markers + trace + stops 전부를 포함하는 영역으로 zoom (legacy zoomToExtentMap) */
  fitAll: () => void;
};

export type TraceOptions = {
  strokeColor?: string;
  strokeWeight?: number;
};

export interface TmapViewProps {
  appKey?: string;
  center?: { lat: number; lon: number };
  zoom?: number;
  markers?: TmapMarker[];
  className?: string;
  onReady?: () => void;
}

const DEFAULT_CENTER = { lat: 37.5665, lon: 126.978 }; // 서울시청
const DEFAULT_ZOOM = 11;

// 현재 테마의 --primary CSS 변수("r g b" 포맷) 를 rgb(...) 로 읽는다.
function readPrimaryColor(): string {
  if (typeof window === "undefined") return "rgb(0, 186, 237)";
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary")
    .trim();
  if (!raw) return "rgb(0, 186, 237)";
  const parts = raw.split(/\s+/);
  if (parts.length === 3 && parts.every((p) => /^\d+(\.\d+)?$/.test(p))) {
    return `rgb(${parts.join(", ")})`;
  }
  // 이미 색상 문자열(#hex, rgb(..) 등)이면 그대로 사용
  return raw;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** 주행 경로 중간 점 — 빨간 작은 원 (6x6, 선보다 작게) */
const RED_DOT_ICON =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6"><circle cx="3" cy="3" r="2" fill="#FF0000"/></svg>',
  );

/** 출발 핀 — 초록 물방울형 */
const START_PIN_ICON =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z" fill="#16a34a" stroke="#FFFFFF" stroke-width="2"/><circle cx="14" cy="14" r="4" fill="#FFFFFF"/></svg>',
  );

/** 도착 핀 — 빨강 물방울형 */
const END_PIN_ICON =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z" fill="#dc2626" stroke="#FFFFFF" stroke-width="2"/><circle cx="14" cy="14" r="4" fill="#FFFFFF"/></svg>',
  );

/** 경유지 핀 — 노랑 물방울형 */
const VIA_PIN_ICON =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z" fill="#eab308" stroke="#FFFFFF" stroke-width="2"/><circle cx="14" cy="14" r="4" fill="#FFFFFF"/></svg>',
  );

/**
 * 트럭 핀 아이콘 + (선택적) 아래쪽 라벨 배지를 포함한 SVG data URL.
 * - translate(7.5, 6.5) 로 핀 상단 원 중심(18,18) 에 트럭 정중앙 배치
 * - 핀 바깥에 테마색 반투명 아웃라인(halo)을 추가 (OUTLINE_PAD 만큼 캔버스 확장)
 */
const PIN_CORE_W = 36;
const PIN_CORE_H = 42;
const OUTLINE_PAD = 5; // 아웃라인용 캔버스 padding (scale 1.18 + stroke 여유)
const PIN_W = PIN_CORE_W + OUTLINE_PAD * 2;
const PIN_H = PIN_CORE_H + OUTLINE_PAD * 2;
const TIP_Y = PIN_CORE_H + OUTLINE_PAD; // SVG 좌표계에서 핀 뾰족한 끝의 y
const LABEL_H = 16;
const LABEL_GAP = 4;

function buildTruckIconUrl(
  color: string,
  labelText?: string,
): {
  url: string;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
} {
  const hasLabel = !!labelText;
  const labelWidth = hasLabel
    ? Math.max(40, (labelText as string).length * 7 + 10)
    : 0;
  const width = Math.max(PIN_W, labelWidth);
  const height = hasLabel ? PIN_H + LABEL_GAP + LABEL_H : PIN_H;
  const pinX = (width - PIN_W) / 2;

  const labelSvg = hasLabel
    ? `
  <g transform="translate(${width / 2} ${PIN_H + LABEL_GAP + LABEL_H / 2})">
    <rect x="-${labelWidth / 2}" y="-${LABEL_H / 2}" width="${labelWidth}" height="${LABEL_H}" rx="4"
          fill="${color}" fill-opacity="0.2" />
    <text x="0" y="3.5" text-anchor="middle" font-size="12" font-weight="600" fill="#222">
      ${escapeXml(labelText as string)}
    </text>
  </g>`
    : "";

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.35"/>
    </filter>
  </defs>
  <g transform="translate(${pinX + OUTLINE_PAD} ${OUTLINE_PAD})">
    <!-- 외곽 링: 본체보다 살짝 크게 확대, 선만 그리고 그림자 미적용 → 선명한 hairline -->
    <path d="M18 0 C8.06 0 0 8.06 0 18 C0 30 18 42 18 42 C18 42 36 30 36 18 C36 8.06 27.94 0 18 0 Z"
          fill="none"
          stroke="${color}" stroke-width="1"
          stroke-linejoin="round"
          transform="translate(18 21) scale(1.18) translate(-18 -21)"/>
    <!-- 본체 핀 (drop-shadow filter 적용) -->
    <path d="M18 0 C8.06 0 0 8.06 0 18 C0 30 18 42 18 42 C18 42 36 30 36 18 C36 8.06 27.94 0 18 0 Z"
          fill="${color}" filter="url(#shadow)"/>
    <g transform="translate(7.5 6.5)" fill="none" stroke="white" stroke-width="1.8"
       stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 18 V4 H1 V15 H3"/>
      <path d="M14 8 H18 L20 12 V15 H18"/>
      <circle cx="6" cy="17" r="2"/>
      <circle cx="16" cy="17" r="2"/>
    </g>
  </g>
  ${labelSvg}
</svg>`.trim();

  return {
    url: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    width,
    height,
    anchorX: width / 2,
    anchorY: TIP_Y, // 외곽선 바깥 여백 제외한 실제 핀 끝점
  };
}

// 스크립트 로더 (singleton)
//
// TMAP v2 부트스트랩 스크립트는 document.write() 로 실제 SDK(tmapjs2.min.js)를
// 추가 로드하는데, 동적 삽입된 <script> 안에서 document.write 는 페이지 로드
// 이후 무시된다. 결과적으로 window.Tmapv2 객체는 생기지만 LatLng/Map 같은
// 실제 클래스가 로드되지 않아 "Tmapv2.LatLng is not a constructor" 가 발생한다.
//
// 해결: 부트스트랩이 document.write 로 출력하는 <script src="..."> 를 가로채서
// 우리가 직접 appendChild 로 다시 로드하고, 그 스크립트의 onload 까지 기다린다.
let scriptPromise: Promise<void> | null = null;

function isSdkReady(): boolean {
  const T = (window as any).Tmapv2;
  return !!(T && typeof T.LatLng === "function" && typeof T.Map === "function");
}

function loadTmapScript(appKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (isSdkReady()) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    // document.write 가로채기
    const origWrite = document.write.bind(document);
    const origWriteln = document.writeln.bind(document);
    const pendingUrls: string[] = [];
    const captureWrite = (html: string) => {
      const re = /<script[^>]*src=['"]([^'"]+)['"][^>]*>/gi;
      let m: RegExpExecArray | null;
      while ((m = re.exec(html)) !== null) pendingUrls.push(m[1]);
    };
    (document as any).write = captureWrite;
    (document as any).writeln = captureWrite;

    const restoreWrite = () => {
      (document as any).write = origWrite;
      (document as any).writeln = origWriteln;
    };

    const bootstrap = document.createElement("script");
    bootstrap.src = `https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=${encodeURIComponent(
      appKey,
    )}`;
    bootstrap.async = true;
    bootstrap.onload = () => {
      restoreWrite();
      if (pendingUrls.length === 0) {
        // 부트스트랩이 write 하지 않은 비정상 케이스 → ready 여부로 판단
        if (isSdkReady()) resolve();
        else {
          scriptPromise = null;
          reject(new Error("TMAP SDK 부트스트랩 이후 클래스가 없습니다."));
        }
        return;
      }
      let loaded = 0;
      let failed = false;
      pendingUrls.forEach((url) => {
        const sdk = document.createElement("script");
        sdk.src = url;
        sdk.async = false; // 로드 순서 유지
        sdk.onload = () => {
          loaded += 1;
          if (loaded === pendingUrls.length && !failed) {
            if (isSdkReady()) resolve();
            else {
              scriptPromise = null;
              reject(
                new Error(
                  "TMAP SDK 로드 완료 후에도 클래스를 찾지 못했습니다.",
                ),
              );
            }
          }
        };
        sdk.onerror = () => {
          if (failed) return;
          failed = true;
          scriptPromise = null;
          reject(new Error(`TMAP SDK 로드 실패: ${url}`));
        };
        document.head.appendChild(sdk);
      });
    };
    bootstrap.onerror = () => {
      restoreWrite();
      scriptPromise = null;
      reject(new Error("TMAP 부트스트랩 스크립트 로드 실패"));
    };
    document.head.appendChild(bootstrap);
  });

  return scriptPromise;
}

export const TmapView = forwardRef<TmapViewHandle, TmapViewProps>(
  function TmapView(
    {
      appKey,
      center = DEFAULT_CENTER,
      zoom = DEFAULT_ZOOM,
      markers = [],
      className,
      onReady,
    },
    ref,
  ) {
    const divRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    const markerObjsRef = useRef<Map<string, any>>(new Map());
    const tracePolylineRef = useRef<any>(null);
    const tracePointsRef = useRef<TracePoint[]>([]);
    /** drawTrace 가 자동 추가하는 보조 마커 (시작/끝 핀 + 중간 점) */
    const traceAuxMarkersRef = useRef<any[]>([]);
    const stopMarkerObjsRef = useRef<Map<string, any>>(new Map());
    const [error, setError] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);
    // 현재 테마 primary 색상 (MutationObserver 로 <html> 변화 감지 시 갱신)
    const [primaryColor, setPrimaryColor] = useState<string>(() =>
      typeof window === "undefined" ? "rgb(0, 186, 237)" : readPrimaryColor(),
    );
    const lastPrimaryRef = useRef<string>(primaryColor);

    // ── 테마 변경 감지: <html> 의 class/style/data-theme 변화에 반응 ────
    useEffect(() => {
      if (typeof window === "undefined") return;
      const root = document.documentElement;
      const update = () => {
        const next = readPrimaryColor();
        setPrimaryColor((prev) => (prev === next ? prev : next));
      };
      update();
      const mo = new MutationObserver(update);
      mo.observe(root, {
        attributes: true,
        attributeFilter: ["class", "style", "data-theme"],
      });
      return () => mo.disconnect();
    }, []);

    const effectiveKey = useMemo(
      () =>
        appKey ||
        (import.meta as any).env?.VITE_TMAP_APP_KEY ||
        "",
      [appKey],
    );

    // ── 지도 초기화 ─────────────────────────────────────────────
    useEffect(() => {
      if (!effectiveKey) {
        setError("TMAP appKey 가 설정되지 않았습니다. VITE_TMAP_APP_KEY 환경변수를 확인하세요.");
        return;
      }

      let cancelled = false;

      loadTmapScript(effectiveKey)
        .then(() => {
          if (cancelled || !divRef.current || mapRef.current) return;
          const Tmapv2 = window.Tmapv2;
          mapRef.current = new Tmapv2.Map(divRef.current, {
            center: new Tmapv2.LatLng(center.lat, center.lon),
            width: "100%",
            height: "100%",
            zoom,
          });
          setLoaded(true);
          onReady?.();
        })
        .catch((e) => {
          if (!cancelled) setError(e?.message ?? "지도 로드 실패");
        });

      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveKey]);

    // ── 컨테이너 리사이즈 대응 (PanelResize 시 재조정) ──────────
    useEffect(() => {
      if (!loaded || !divRef.current) return;
      const target = divRef.current;
      const observer = new ResizeObserver(() => {
        const map = mapRef.current;
        if (!map) return;
        // TMAP v2: resize 는 내부 _resize 또는 setSize 사용
        if (typeof map.resize === "function") {
          map.resize();
        } else if (typeof map.setSize === "function") {
          map.setSize(
            new window.Tmapv2.Size(target.clientWidth, target.clientHeight),
          );
        }
      });
      observer.observe(target);
      return () => observer.disconnect();
    }, [loaded]);

    // ── 마커 동기화 ─────────────────────────────────────────────
    useEffect(() => {
      if (!loaded) return;
      const Tmapv2 = window.Tmapv2;
      if (!Tmapv2 || !mapRef.current) return;

      const prev = markerObjsRef.current;

      // 테마(primary) 가 바뀌었으면 기존 마커 SVG 가 stale 이므로 전부 제거 후 재생성
      if (lastPrimaryRef.current !== primaryColor) {
        prev.forEach((obj) => obj.setMap(null));
        prev.clear();
        lastPrimaryRef.current = primaryColor;
      }

      const nextIds = new Set(markers.map((m) => m.id));

      // 사라진 마커 제거
      prev.forEach((obj, id) => {
        if (!nextIds.has(id)) {
          obj.setMap(null);
          prev.delete(id);
        }
      });

      // 추가/갱신
      markers.forEach((m) => {
        // 좌표 유효성 방어 — null/NaN이 오면 Tmapv2 내부에서 터짐
        if (
          !Number.isFinite(m.lat) ||
          !Number.isFinite(m.lon) ||
          Math.abs(m.lat) > 90 ||
          Math.abs(m.lon) > 180
        ) {
          return;
        }
        let existing = prev.get(m.id);
        const position = new Tmapv2.LatLng(m.lat, m.lon);
        if (existing) {
          try {
            existing.setPosition(position);
            const titleText = m.tooltip ?? m.label;
            if (titleText && typeof existing.setTitle === "function") {
              existing.setTitle(titleText);
            }
            return;
          } catch (e) {
            // 기존 마커가 손상된 경우 제거 후 재생성 경로로 fallthrough
            console.warn("[TmapView] marker.setPosition failed, recreating", e);
            try {
              existing.setMap(null);
            } catch {}
            prev.delete(m.id);
            existing = undefined;
          }
        }
        const built = buildTruckIconUrl(primaryColor, m.label);
        const marker = new Tmapv2.Marker({
          position,
          map: mapRef.current,
          title: m.tooltip ?? m.label ?? m.id,
          icon: m.iconUrl ?? built.url,
          iconSize: new Tmapv2.Size(built.width, built.height),
          iconAnchor: new Tmapv2.Point(built.anchorX, built.anchorY),
        });
        if (m.onClick) {
          marker.addListener("click", m.onClick);
        }
        prev.set(m.id, marker);
      });
    }, [loaded, markers, primaryColor]);

    // ── imperative handle ───────────────────────────────────────
    useImperativeHandle(
      ref,
      () => ({
        panTo: (lat, lon, z) => {
          const map = mapRef.current;
          if (!map || !window.Tmapv2) return;
          map.setCenter(new window.Tmapv2.LatLng(lat, lon));
          if (typeof z === "number") map.setZoom(z);
        },
        fitMarkers: () => {
          const map = mapRef.current;
          const Tmapv2 = window.Tmapv2;
          if (!map || !Tmapv2 || markers.length === 0) return;
          if (markers.length === 1) {
            map.setCenter(new Tmapv2.LatLng(markers[0].lat, markers[0].lon));
            return;
          }
          const bounds = new Tmapv2.LatLngBounds();
          markers.forEach((m) =>
            bounds.extend(new Tmapv2.LatLng(m.lat, m.lon)),
          );
          map.fitBounds(bounds);
        },
        getMap: () => mapRef.current,
        drawTrace: (points, options) => {
          const map = mapRef.current;
          const Tmapv2 = window.Tmapv2;
          if (!map || !Tmapv2) return;

          // 유효 좌표만
          const valid = points.filter(
            (p) =>
              Number.isFinite(p.lat) &&
              Number.isFinite(p.lon) &&
              Math.abs(p.lat) <= 90 &&
              Math.abs(p.lon) <= 180 &&
              !(p.lat === 0 && p.lon === 0),
          );
          tracePointsRef.current = valid;

          // 기존 polyline + 보조 마커 제거
          if (tracePolylineRef.current) {
            tracePolylineRef.current.setMap(null);
            tracePolylineRef.current = null;
          }
          traceAuxMarkersRef.current.forEach((m) => m.setMap(null));
          traceAuxMarkersRef.current = [];

          if (valid.length === 0) return;

          // 시작/끝 핀 — 서로 다른 아이콘 (출발:초록 / 도착:빨강)
          const makeEndpointMarker = (
            p: TracePoint,
            label: string,
            iconUrl: string,
          ) => {
            const labelHtml = `<span style="background:#a8c4ef;color:#000;font-weight:bold;padding:2px 6px;border-radius:5px;border:1px solid #000;">${escapeXml(label)}</span>`;
            return new Tmapv2.Marker({
              position: new Tmapv2.LatLng(p.lat, p.lon),
              map,
              title: label,
              label: labelHtml,
              icon: iconUrl,
              iconSize: new Tmapv2.Size(28, 36),
              iconAnchor: new Tmapv2.Point(14, 36),
            });
          };
          // 거쳐간 점 — 선(5px)보다 작은 빨간 원(6x6, 가시 4px)
          const makeTracePointMarker = (p: TracePoint) =>
            new Tmapv2.Marker({
              position: new Tmapv2.LatLng(p.lat, p.lon),
              map,
              icon: RED_DOT_ICON,
              iconSize: new Tmapv2.Size(6, 6),
              iconAnchor: new Tmapv2.Point(3, 3),
            });

          // 중간 포인트 먼저 (아래 레이어)
          for (let i = 1; i < valid.length - 1; i++) {
            traceAuxMarkersRef.current.push(makeTracePointMarker(valid[i]));
          }
          // 시작/끝 핀 (위 레이어)
          traceAuxMarkersRef.current.push(
            makeEndpointMarker(valid[0], "출발", START_PIN_ICON),
          );
          if (valid.length > 1) {
            traceAuxMarkersRef.current.push(
              makeEndpointMarker(valid[valid.length - 1], "도착", END_PIN_ICON),
            );

            // polyline — 검정
            const path = valid.map((p) => new Tmapv2.LatLng(p.lat, p.lon));
            tracePolylineRef.current = new Tmapv2.Polyline({
              path,
              strokeColor: options?.strokeColor ?? "#000000",
              strokeWeight: options?.strokeWeight ?? 5,
              strokeStyle: "solid",
              map,
              direction: true,
              directionColor: "#ffffff",
              directionOpacity: 1,
            });
          }

          // 자동 fit
          if (valid.length === 1) {
            map.setCenter(new Tmapv2.LatLng(valid[0].lat, valid[0].lon));
          } else {
            const bounds = new Tmapv2.LatLngBounds();
            valid.forEach((p) => bounds.extend(new Tmapv2.LatLng(p.lat, p.lon)));
            map.fitBounds(bounds, 100);
          }
        },
        clearTrace: () => {
          if (tracePolylineRef.current) {
            tracePolylineRef.current.setMap(null);
            tracePolylineRef.current = null;
          }
          traceAuxMarkersRef.current.forEach((m) => m.setMap(null));
          traceAuxMarkersRef.current = [];
          tracePointsRef.current = [];
        },
        fitTrace: () => {
          const map = mapRef.current;
          const Tmapv2 = window.Tmapv2;
          const pts = tracePointsRef.current;
          if (!map || !Tmapv2 || pts.length === 0) return;
          if (pts.length === 1) {
            map.setCenter(new Tmapv2.LatLng(pts[0].lat, pts[0].lon));
            return;
          }
          const bounds = new Tmapv2.LatLngBounds();
          pts.forEach((p) => bounds.extend(new Tmapv2.LatLng(p.lat, p.lon)));
          map.fitBounds(bounds, 100);
        },
        drawStopMarkers: (stops) => {
          const map = mapRef.current;
          const Tmapv2 = window.Tmapv2;
          if (!map || !Tmapv2) return;

          // 기존 stop 마커 전부 제거
          stopMarkerObjsRef.current.forEach((obj) => obj.setMap(null));
          stopMarkerObjsRef.current.clear();

          stops.forEach((s) => {
            if (
              !Number.isFinite(s.lat) ||
              !Number.isFinite(s.lon) ||
              Math.abs(s.lat) > 90 ||
              Math.abs(s.lon) > 180 ||
              (s.lat === 0 && s.lon === 0)
            ) {
              return;
            }
            const labelHtml = s.label
              ? `<span style="background:#a8c4ef;color:#000;font-weight:bold;padding:2px 6px;border-radius:5px;border:1px solid #000;">${escapeXml(s.label)}</span>`
              : undefined;

            // kind 별 아이콘 결정
            let iconUrl: string | undefined;
            if (s.kind === "start") iconUrl = START_PIN_ICON;
            else if (s.kind === "end") iconUrl = END_PIN_ICON;
            else if (s.kind === "via") iconUrl = VIA_PIN_ICON;

            const markerOpts: any = {
              position: new Tmapv2.LatLng(s.lat, s.lon),
              map,
              title: s.title ?? s.label ?? s.id,
              label: labelHtml,
            };
            if (iconUrl) {
              markerOpts.icon = iconUrl;
              markerOpts.iconSize = new Tmapv2.Size(28, 36);
              markerOpts.iconAnchor = new Tmapv2.Point(14, 36);
            }
            const marker = new Tmapv2.Marker(markerOpts);
            stopMarkerObjsRef.current.set(s.id, marker);
          });
        },
        clearStopMarkers: () => {
          stopMarkerObjsRef.current.forEach((obj) => obj.setMap(null));
          stopMarkerObjsRef.current.clear();
        },
        fitAll: () => {
          const map = mapRef.current;
          const Tmapv2 = window.Tmapv2;
          if (!map || !Tmapv2) return;
          const pts: { lat: number; lon: number }[] = [
            ...markers.map((m) => ({ lat: m.lat, lon: m.lon })),
            ...tracePointsRef.current,
          ];
          stopMarkerObjsRef.current.forEach((obj) => {
            const pos = obj.getPosition?.();
            if (!pos) return;
            const lat = pos._lat ?? pos.lat?.();
            const lon = pos._lng ?? pos.lng?.();
            if (Number.isFinite(lat) && Number.isFinite(lon)) {
              pts.push({ lat, lon });
            }
          });
          const valid = pts.filter(
            (p) =>
              Number.isFinite(p.lat) &&
              Number.isFinite(p.lon) &&
              !(p.lat === 0 && p.lon === 0),
          );
          if (valid.length === 0) return;
          if (valid.length === 1) {
            map.setCenter(new Tmapv2.LatLng(valid[0].lat, valid[0].lon));
            return;
          }
          const bounds = new Tmapv2.LatLngBounds();
          valid.forEach((p) =>
            bounds.extend(new Tmapv2.LatLng(p.lat, p.lon)),
          );
          map.fitBounds(bounds, 100);
        },
      }),
      [markers],
    );

    return (
      <div
        className={`relative w-full h-full min-h-0 min-w-0 ${className ?? ""}`}
      >
        <div ref={divRef} className="absolute inset-0" />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-sm text-slate-500 p-4 text-center">
            {error}
          </div>
        )}
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-xs text-slate-400">
            지도 로드 중...
          </div>
        )}
      </div>
    );
  },
);
