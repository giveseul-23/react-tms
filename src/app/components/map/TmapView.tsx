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
  label?: string;
  iconUrl?: string;
  onClick?: () => void;
};

export type TmapViewHandle = {
  /** 특정 좌표로 지도 중심 이동 */
  panTo: (lat: number, lon: number, zoom?: number) => void;
  /** 모든 마커가 보이도록 영역 맞춤 */
  fitMarkers: () => void;
  /** 원본 map 객체 접근 */
  getMap: () => any | null;
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

// 기본 마커 아이콘: 트럭 (lucide-react Truck 경로 기반 SVG data URL)
// - translate(7.5, 6.5) 로 핀 상단 원 중심(18,18) 에 정확히 맞춤
function buildTruckIconUrl(color: string): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="42" viewBox="0 0 36 42">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.35"/>
    </filter>
  </defs>
  <path d="M18 0 C8.06 0 0 8.06 0 18 C0 30 18 42 18 42 C18 42 36 30 36 18 C36 8.06 27.94 0 18 0 Z"
        fill="${color}" filter="url(#shadow)"/>
  <g transform="translate(7.5 6.5)" fill="none" stroke="white" stroke-width="1.8"
     stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 18 V4 H1 V15 H3"/>
    <path d="M14 8 H18 L20 12 V15 H18"/>
    <circle cx="6" cy="17" r="2"/>
    <circle cx="16" cy="17" r="2"/>
  </g>
</svg>`.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
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
              reject(new Error("TMAP SDK 로드 완료 후에도 클래스를 찾지 못했습니다."));
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
    const [error, setError] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);

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
      // center/zoom 변화는 imperative API 로 제어
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
      const nextIds = new Set(markers.map((m) => m.id));

      // 제거
      prev.forEach((obj, id) => {
        if (!nextIds.has(id)) {
          obj.setMap(null);
          prev.delete(id);
        }
      });

      // 추가/갱신
      markers.forEach((m) => {
        const existing = prev.get(m.id);
        const position = new Tmapv2.LatLng(m.lat, m.lon);
        if (existing) {
          existing.setPosition(position);
          if (m.label && typeof existing.setTitle === "function") {
            existing.setTitle(m.label);
          }
          return;
        }
        const iconUrl = m.iconUrl ?? buildTruckIconUrl(readPrimaryColor());
        const marker = new Tmapv2.Marker({
          position,
          map: mapRef.current,
          title: m.label ?? m.id,
          icon: iconUrl,
          iconSize: new Tmapv2.Size(36, 42),
          iconAnchor: new Tmapv2.Point(18, 42), // 핀 끝(좌표 점)을 마커 기준점으로
        });
        if (m.onClick) {
          marker.addListener("click", m.onClick);
        }
        prev.set(m.id, marker);
      });
    }, [loaded, markers]);

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
