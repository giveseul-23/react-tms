// src/views/drvhstry/DriveHistoryModel.ts
import { useRef, useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";
import type { TmapViewHandle } from "@/app/components/map/TmapView";

export type GridKey = "main";

export function useDriveHistoryModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  const mapRef = useRef<TmapViewHandle | null>(null);

  const { codeMap } = useCommonStores({
    vehOpTypeList: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
  });

  return { ...base, mapRef, codeMap };
}

export type DriveHistoryModel = ReturnType<typeof useDriveHistoryModel>;
