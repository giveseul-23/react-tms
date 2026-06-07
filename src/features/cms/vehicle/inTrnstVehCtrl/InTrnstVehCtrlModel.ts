// src/views/inTrnstVehCtrl/InTrnstVehCtrlModel.ts
import { useRef } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import type { TmapViewHandle } from "@/app/components/map/TmapView";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey = "main";

export function useInTrnstVehCtrlModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  const mapRef = useRef<TmapViewHandle | null>(null);

  const { codeMap } = useCommonStores({
    vehOpTpList: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
  });

  return { ...base, mapRef, codeMap };
}

export type InTrnstVehCtrlModel = ReturnType<typeof useInTrnstVehCtrlModel>;
