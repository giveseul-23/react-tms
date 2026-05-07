// src/views/vehicleMgmt/VehicleMgmtModel.ts
import { useState, useCallback, useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// 운영상태 컬러맵
export const VEH_OP_STS_COLOR_MAP: Record<string, string> = {
  "100": "bg-emerald-100 text-emerald-700",
  "200": "bg-amber-100 text-amber-700",
  "300": "bg-red-100 text-red-700",
};

export type DetailMode = "view" | "edit" | "new";

export type GridKey = "main";

export function useVehicleMgmtModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // ── 상세 패널 ────────────────────────────────────────────────
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailMode, setDetailMode] = useState<DetailMode>("view");
  const [detailData, setDetailData] = useState<any>({});
  const [detailIndex, setDetailIndex] = useState(-1);
  const [navigating, setNavigating] = useState(false);

  // ── 신규 등록 슬라이드 ────────────────────────────────────────
  const [newSlideOpen, setNewSlideOpen] = useState(false);
  const [newFormData, setNewFormData] = useState<any>({});

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    base.grids.main.setSelected(null);
    setDetailIndex(-1);
  }, [base.grids.main]);

  // ── 공통 코드 스토어 ─────────────────────────────────────────
  const { stores } = useCommonStores({
    apProcTp: { sqlProp: "CODE", keyParam: "AP_PROC_TP" },
    vehOpTp: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
    transTcd: { sqlProp: "CODE", keyParam: "TRANS_TCD" },
    vehTempTcd: { sqlProp: "CODE", keyParam: "VEH_TEMP_TCD" },
    vehicleTemperatureRange: {
      sqlProp: "selectVehicleTemperatureRange",
      keyParam: "selectVehicleTemperatureRange",
    },
    schedTcd: { sqlProp: "CODE", keyParam: "SCHED_TCD" },
    distTcd: { sqlProp: "CODE", keyParam: "DIST_TCD" },
    exVehTcd: { sqlProp: "CODE", keyParam: "EX_VEH_TCD" },
    vehDtlTcd: { sqlProp: "CODE", keyParam: "VEH_DTL_TCD" },
    fuelTcd: { sqlProp: "CODE", keyParam: "FUEL_TCD" },
    vehOperScd: { sqlProp: "CODE", keyParam: "VEH_OPER_SCD" },
    vehGrpCd: { sqlProp: "CODE", keyParam: "VEH_GRP_CD" },
    vehDspchTp: { sqlProp: "CODE", keyParam: "VEH_DISPATCH_TP" },
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
    detailOpen,
    setDetailOpen,
    detailMode,
    setDetailMode,
    detailData,
    setDetailData,
    detailIndex,
    setDetailIndex,
    navigating,
    setNavigating,
    closeDetail,
    newSlideOpen,
    setNewSlideOpen,
    newFormData,
    setNewFormData,
    codeMap,
    stores,
  };
}

export type VehicleMgmtModel = ReturnType<typeof useVehicleMgmtModel>;
