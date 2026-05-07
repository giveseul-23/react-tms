// src/views/tender/TenderReceiveDispatchModel.ts
import { useState, useRef, useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";
import type { TrackType } from "@/app/components/track/trackColumns";

export const DISPATCH_STATUS_COLOR_MAP: Record<string, string> = {
  "2030": "bg-purple-100 text-purple-700",
  "2040": "bg-purple-100 text-purple-700",
  "2050": "bg-purple-100 text-purple-700",
  "2060": "bg-purple-100 text-purple-700",
  "2070": "bg-sky-100 text-sky-700",
  "2073": "bg-sky-100 text-sky-700",
  "2075": "bg-sky-100 text-sky-700",
  "2080": "bg-blue-100 text-blue-700",
  "2090": "bg-blue-100 text-blue-700",
  "2100": "bg-emerald-100 text-emerald-700",
  "2103": "bg-emerald-100 text-emerald-700",
  "2105": "bg-emerald-100 text-emerald-700",
  "2110": "bg-emerald-100 text-emerald-700",
};

export type GridKey = "main" | "stop" | "sms" | "apSetl";

export function useTenderReceiveDispatchModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 추적 패널
  const [trackOpen, setTrackOpen] = useState(false);
  const [trackType, setTrackType] = useState<TrackType | null>(null);
  const [trackDspchNos, setTrackDspchNos] = useState<string[]>([]);

  // apSetl 그리드 ag-grid ref (stopEditing 등)
  const apSetlGridRef = useRef<any>(null);

  const { stores } = useCommonStores({
    dspchOpSts: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    apFiSts: { sqlProp: "CODE", keyParam: "AP_FI_STS" },
  });

  const codeMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    Object.entries(stores).forEach(([storeKey, items]) => {
      map[storeKey] = {};
      (items ?? []).forEach((item: any) => {
        map[storeKey][item.CODE] = item.NAME;
      });
    });
    return map;
  }, [stores]);

  return {
    ...base,
    trackOpen,
    setTrackOpen,
    trackType,
    setTrackType,
    trackDspchNos,
    setTrackDspchNos,
    apSetlGridRef,
    codeMap,
  };
}

export type TenderReceiveDispatchModel = ReturnType<
  typeof useTenderReceiveDispatchModel
>;
