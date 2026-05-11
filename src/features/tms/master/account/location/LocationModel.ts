import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

export type GridKey =
  | "main"
  | "entryRestriction"
  | "assignedVehicle"
  | "dateProhibition"
  | "registeredZone"
  | "holiday"
  | "preferredCarrier"
  | "arrivalRequestTime"
  | "sms"
  | "locationRole"
  | "locSales"
  | "etc"
  | "orderTypePlanId";

export function useLocationModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const { codeMap } = useCommonStores({
    locTp: { sqlProp: "CODE", keyParam: "LOC_TP" },
    timeUnit: { sqlProp: "CODE", keyParam: "VAR_LD_UNL_TIME_UNIT" },
    shipToTpList: { sqlProp: "CODE", keyParam: "SHIPTO_TCD" },
    transUnitTpList: { sqlProp: "CODE", keyParam: "TRANS_UNIT_TCD" },
    dlvryTurnCd: { sqlProp: "CODE", keyParam: "DLVRY_TURN_CD" },
    dcLocGrpTcd: { sqlProp: "CODE", keyParam: "DC_LOC_GRP_TCD" },
    dcTcd: { sqlProp: "CODE", keyParam: "DC_TCD" },
    distDivCd: { sqlProp: "CODE", keyParam: "DIST_DIV_CD" },
    dockTcd: { sqlProp: "CODE", keyParam: "DOCK_TCD" },
    locRoleTp: { sqlProp: "CODE", keyParam: "HARIM_ROLE_TYPE" },
    locPrimeTp: { sqlProp: "CODE", keyParam: "LOC_PRIME_TP" },
  });

  return { ...base, codeMap };
}

export type LocationModel = ReturnType<typeof useLocationModel>;
