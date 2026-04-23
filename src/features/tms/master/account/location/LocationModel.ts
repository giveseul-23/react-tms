import { useState, useRef, useCallback, useMemo } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";

export type GridData = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

const EMPTY_GRID: GridData = {
  rows: [],
  totalCount: 0,
  page: 1,
  limit: 500,
};

export function useLocationModel() {
  const [layout, setLayout] = useState<LayoutType>("vertical");
  const [pageSize, setPageSize] = useState(500);

  const [gridData, setGridData] = useState<GridData>(EMPTY_GRID);

  // 탭별 서브 그리드
  const [entryRestrictionRowData, setEntryRestrictionRowData] = useState<any[]>(
    [],
  );
  const [assignedVehicleRowData, setAssignedVehicleRowData] = useState<any[]>(
    [],
  );
  const [dateProhibitionRowData, setDateProhibitionRowData] = useState<any[]>(
    [],
  );
  const [registeredZoneRowData, setRegisteredZoneRowData] = useState<any[]>([]);
  const [holidayRowData, setHolidayRowData] = useState<any[]>([]);
  const [preferredCarrierRowData, setPreferredCarrierRowData] = useState<any[]>(
    [],
  );
  const [arrivalRequestTimeRowData, setArrivalRequestTimeRowData] = useState<
    any[]
  >([]);
  const [smsRowData, setSmsRowData] = useState<any[]>([]);
  const [locationRoleRowData, setLocationRoleRowData] = useState<any[]>([]);
  const [locSalesRowData, setLocSalesRowData] = useState<any[]>([]);
  const [etcRowData, setEtcRowData] = useState<any[]>([]);
  const [orderTypePlanIdRowData, setOrderTypePlanIdRowData] = useState<any[]>(
    [],
  );

  const [selectedHeaderRow, setSelectedHeaderRow] = useState<any>(null);
  const selectedHeaderRowRef = useRef<any>(null);
  const setSelectedHeaderRowWithRef = useCallback((row: any) => {
    setSelectedHeaderRow(row);
    selectedHeaderRowRef.current = row;
  }, []);

  const resetSubGrids = useCallback(() => {
    setSelectedHeaderRowWithRef(null);
    setEntryRestrictionRowData([]);
    setAssignedVehicleRowData([]);
    setDateProhibitionRowData([]);
    setRegisteredZoneRowData([]);
    setHolidayRowData([]);
    setPreferredCarrierRowData([]);
    setArrivalRequestTimeRowData([]);
    setSmsRowData([]);
    setLocationRoleRowData([]);
    setLocSalesRowData([]);
    setEtcRowData([]);
    setOrderTypePlanIdRowData([]);
  }, [setSelectedHeaderRowWithRef]);

  const { stores } = useCommonStores({
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
    layout,
    setLayout,
    pageSize,
    setPageSize,
    gridData,
    setGridData,
    entryRestrictionRowData,
    setEntryRestrictionRowData,
    assignedVehicleRowData,
    setAssignedVehicleRowData,
    dateProhibitionRowData,
    setDateProhibitionRowData,
    registeredZoneRowData,
    setRegisteredZoneRowData,
    holidayRowData,
    setHolidayRowData,
    preferredCarrierRowData,
    setPreferredCarrierRowData,
    arrivalRequestTimeRowData,
    setArrivalRequestTimeRowData,
    smsRowData,
    setSmsRowData,
    locationRoleRowData,
    setLocationRoleRowData,
    locSalesRowData,
    setLocSalesRowData,
    etcRowData,
    setEtcRowData,
    orderTypePlanIdRowData,
    setOrderTypePlanIdRowData,
    selectedHeaderRow,
    selectedHeaderRowRef,
    setSelectedHeaderRow: setSelectedHeaderRowWithRef,
    resetSubGrids,
    codeMap,
  };
}

export type LocationModel = ReturnType<typeof useLocationModel>;
