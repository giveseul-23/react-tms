// src/views/dtgdailyvehhis/DtgDailyVehHisControllerModel.ts
import { useRef } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import type { TmapViewHandle } from "@/app/components/map/TmapView";

export type GridKey = "main";

export function useDtgDailyVehHisControllerModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  const mapRef = useRef<TmapViewHandle | null>(null);
  return { ...base, mapRef };
}

export type DtgDailyVehHisControllerModel = ReturnType<
  typeof useDtgDailyVehHisControllerModel
>;
