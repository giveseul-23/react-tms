// src/views/drvhstry/DriveHistoryModel.ts
import { useRef, useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";
import type { TmapViewHandle } from "@/app/components/map/TmapView";

export type GridKey = "main";

export function useDriveHistoryModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  const mapRef = useRef<TmapViewHandle | null>(null);

  const { stores } = useCommonStores({
    vehOpTypeList: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
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

  return { ...base, mapRef, stores, codeMap };
}

export type DriveHistoryModel = ReturnType<typeof useDriveHistoryModel>;
