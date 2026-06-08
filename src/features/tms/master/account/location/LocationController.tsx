import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { locationApi as api } from "./LocationApi";
import { MENU_CD } from "./Location";
import type { LocationModel, GridKey } from "./LocationModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { usePopup } from "@/app/components/popup/PopupContext";
import VehicleAddPopup from "./popup/VehicleAddPopup";
import RegionAddPopup from "./popup/RegionAddPopup";
import LocationMapPopup from "./popup/LocationMapPopup";
import LatLonEditPopup from "./popup/LatLonEditPopup";
import { commitRowChanges } from "@/app/components/grid/gridUtils/rowStatus";
import { CommonPopup } from "@/app/components/popup/CommonPopup";

const masterParam = (row: any) => ({ LOC_ID: row?.LOC_ID });

type SubKey = Exclude<GridKey, "main">;

// sub 그리드별 ─ fetch / save 매핑 (cascade 재조회 + 저장)
// TODO: 각 save 의 실제 endpoint 와 신규행 기본값은 LocationApi.ts / 비즈니스 로직에 맞춰 사용자가 보강
const SUB_CONFIG: Array<{
  key: SubKey;
  parentLabel: string;
  saveFn: (p: { dsSave: any[] }) => Promise<any>;
  fetchFn: (p: any) => Promise<any>;
  /** 신규행 추가 시 LOC_ID 외 추가로 채울 기본값 (센차 onAddXxx 대응). */
  addDefaults?: (main: any) => Record<string, any>;
}> = [
  {
    key: "entryRestriction",
    parentLabel: "LBL_LOCATION",
    saveFn: (p) => api.saveEntryRestriction(p),
    fetchFn: (p) => api.getEntryRestrictionList(p),
  },
  {
    key: "assignedVehicle",
    parentLabel: "LBL_LOCATION",
    saveFn: (p) => api.saveAssignedVehicle(p),
    fetchFn: (p) => api.getAssignedVehicleList(p),
  },
  {
    key: "dateProhibition",
    parentLabel: "LBL_LOCATION",
    saveFn: (p) => api.saveExcludedVehicle(p),
    fetchFn: (p) => api.getExcludedVehicleList(p),
  },
  {
    key: "registeredZone",
    parentLabel: "LBL_LOCATION",
    saveFn: (p) => api.saveRegisteredZone(p),
    fetchFn: (p) => api.getRegisteredZoneList(p),
  },
  {
    key: "holiday",
    parentLabel: "LBL_LOCATION",
    saveFn: (p) => api.saveHoliday(p),
    fetchFn: (p) => api.getHolidayList(p),
  },
  {
    key: "preferredCarrier",
    parentLabel: "LBL_LOCATION",
    saveFn: (p) => api.savePreferredCarrier(p),
    fetchFn: (p) => api.getPreferredCarrierList(p),
  },
  {
    key: "arrivalRequestTime",
    parentLabel: "LBL_LOCATION",
    saveFn: (p) => api.saveArrivalRequestTime(p),
    fetchFn: (p) => api.getArrivalRequestTimeList(p),
  },
  // 도크 — 추가 시 main 의 LOC_CD/LOC_NM + 확약/최대허용시간 기본값(센차 onAddDock).
  {
    key: "dock",
    parentLabel: "LBL_LOCATION",
    saveFn: (p) => api.saveDock(p),
    fetchFn: (p) => api.getDockList(p),
    addDefaults: (m) => ({
      LOC_CD: m?.LOC_CD,
      LOC_NM: m?.LOC_NM,
      CMMT_UNIT_TM: 10,
      ALW_MAX_CMMT_TM: 120,
    }),
  },
  {
    key: "sms",
    parentLabel: "LBL_LOCATION",
    saveFn: (p) => api.saveSms(p),
    fetchFn: (p) => api.getSmsList(p),
  },
  {
    key: "locationRole",
    parentLabel: "LBL_LOCATION",
    saveFn: (p) => api.saveLocationRole(p),
    fetchFn: (p) => api.getLocationRoleList(p),
  },
  {
    key: "locSales",
    parentLabel: "LBL_LOCATION",
    saveFn: (p) => api.saveLocSales(p),
    fetchFn: (p) => api.getLocSalesList(p),
  },
  {
    key: "etc",
    parentLabel: "LBL_LOCATION",
    saveFn: (p) => api.saveEtc(p),
    fetchFn: (p) => api.getEtcList(p),
  },
  {
    key: "orderTypePlanId",
    parentLabel: "LBL_LOCATION",
    saveFn: (p) => api.saveOrderTypePlanId(p),
    fetchFn: (p) => api.getOrderTypePlanIdList(p),
  },
];

interface Args {
  model: LocationModel;
}

export function useLocationController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();
  const { setDetailTab } = model; // 추가 후 해당 detail 탭으로 전환 (안정 참조)

  // ── 지정차량 추가 (센차 onAddVeh → LocationAssignVeh 팝업) ──
  // 선택한 LBL_LOCATION에 차량검색 팝업(VehicleAddPopup)으로 고른 차량을 지정차량 그리드에 추가.
  // (추가된 행은 지정차량 탭의 저장으로 확정 — 그리드 표준 add→save 흐름)
  const onAddAssignedVehicle = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "LBL_LOCATION")) return;
    openPopup({
      title: "BTN_ADD_ASSIGNED_VEHICLE",
      width: "4xl",
      content: (
        <VehicleAddPopup
          onConfirm={(payload: any) => {
            const rows = Array.isArray(payload) ? payload : [payload];
            rows.forEach((v: any) =>
              base.addRow("assignedVehicle", { LOC_ID: main.LOC_ID, ...v }),
            );
            closePopup();
            setDetailTab("ASSIGNED_VEHICLE");
          }}
          onClose={() => closePopup()}
        />
      ),
    });
  }, [base, model.grids.main, setDetailTab, openPopup, closePopup]);

  // ── 권역 추가 (센차 onAddRegion → LocationRegion 팝업) ──────
  // 선택 LBL_LOCATION에 권역검색 팝업으로 고른 권역을 saveZone 으로 저장 → 등록권역 sub 재조회.
  const onAddZone = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "LBL_LOCATION")) return;
    openPopup({
      title: "BTN_ADD_ZONE",
      width: "3xl",
      content: (
        <RegionAddPopup
          locRows={[main]}
          onApplied={() => {
            closePopup();
            setDetailTab("REGISTERED_ZONE");
            base.searchSub(
              "registeredZone",
              api.getRegisteredZoneList({ LOC_ID: main.LOC_ID }),
            );
          }}
          onClose={() => closePopup()}
        />
      ),
    });
  }, [base, model.grids.main, setDetailTab, openPopup, closePopup]);

  // ── 지도 보기 (센차 onPopShowLocation → PopMarkerMap, 조회전용) ──
  const onViewByMap = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "LBL_LOCATION")) return;
    openPopup({
      title: "BTN_VIEW_BY_MAP",
      width: "4xl",
      content: (
        <LocationMapPopup locRows={[main]} onClose={() => closePopup()} />
      ),
    });
  }, [base, model.grids.main, openPopup, closePopup]);

  // ── 위경도 수정 (센차 onPopEditMap → PopMap) ───────────────
  // 지도 클릭으로 위경도 설정 + 주소 입력 → 적용 시 메인행 LAT/LON/주소 갱신(EDIT_STS U).
  const onEditLatLon = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "LBL_LOCATION")) return;
    openPopup({
      title: "BTN_EDIT_LATLON",
      width: "4xl",
      content: (
        <LatLonEditPopup
          row={main}
          onApply={(patch) => {
            commitRowChanges(model.grids.main.setData, main, patch);
            closePopup();
          }}
          onClose={() => closePopup()}
        />
      ),
    });
  }, [base, model.grids.main, openPopup, closePopup]);

  // ── 메인 fetch ─────────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // ── 메인 클릭 → 12개 sub cascade ───────────────────────────
  const onMainGridClick = useCallback(
    (row: any) => {
      model.grids.main.setSelected(row);

      return base.handleRowClick(
        "main",
        row,
        SUB_CONFIG.map(({ key, fetchFn }) => ({
          to: key,
          fetch: (r: any) => fetchFn(masterParam(r)),
        })),
      );
    },
    [base, model.grids.main],
  );

  // ── 메인 조회 후 첫 행 자동 선택 + cascade ─────────────────
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // ── 메인 저장 ──────────────────────────────────────────────
  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.save, {
        confirmOnDelete: "MSG_CHK_DELETE",
      }),
    [base],
  );

  // ── 12개 sub actions 일괄 생성 ─────────────────────────────
  // 각 sub: Add (LOC_ID 자동 채움) + Save (main cascade 재조회).
  // TODO: 신규행 기본값은 sub 별로 더 채워야 할 수 있음 (예: 코드 기본값, 시퀀스 등).
  const subActions = useMemo(() => {
    const map = {} as Record<SubKey, ActionItem[]>;
    SUB_CONFIG.forEach(({ key, parentLabel, saveFn, fetchFn, addDefaults }) => {
      map[key] = [
        makeAddAction({
          onClick: () => {
            const main = model.grids.main.selectedRef.current;
            if (!base.requireParentRow(main, parentLabel)) return;
            if (key === "registeredZone") {
              onAddZone();
            } else if (key === "entryRestriction") {
              openPopup({
                title: "BTN_ADD_ZONE",
                width: "3xl",
                content: (
                  <CommonPopup
                    sqlId="selectVehTpList"
                    onApply={(picked: any) => {
                      base.addRow(key, {
                        LOC_ID: main.LOC_ID,
                        VEH_TP_CD: picked.CODE,
                        VEH_TP_NM: picked.NAME,
                      });
                      closePopup();
                    }}
                    onClose={closePopup}
                  />
                ),
              });
            } else if (key === "assignedVehicle") {
              openPopup({
                title: "BTN_ADD_ASSIGNED_VEHICLE",
                width: "4xl",
                content: (
                  <VehicleAddPopup
                    onConfirm={(payload: any) => {
                      const rows = Array.isArray(payload) ? payload : [payload];
                      rows.forEach((v: any) =>
                        base.addRow("assignedVehicle", {
                          LOC_ID: main.LOC_ID,
                          ...v,
                        }),
                      );
                      closePopup();
                      setDetailTab("ASSIGNED_VEHICLE");
                    }}
                    onClose={() => closePopup()}
                  />
                ),
              });
            } else if (key === "dateProhibition") {
              openPopup({
                title: "BTN_ADD_ASSIGNED_VEHICLE",
                width: "4xl",
                content: (
                  <VehicleAddPopup
                    onConfirm={(payload: any) => {
                      const rows = Array.isArray(payload) ? payload : [payload];
                      rows.forEach((v: any) =>
                        base.addRow("dateProhibition", {
                          LOC_ID: main.LOC_ID,
                          ...v,
                        }),
                      );
                      closePopup();
                      setDetailTab("DATE_PROHIBITION");
                    }}
                    onClose={() => closePopup()}
                  />
                ),
              });
            } else if (key === "arrivalRequestTime") {
              base.addRow(key, {
                LOC_ID: main.LOC_ID,
                LOC_CD: main.LOC_CD,
                LOC_NM: main.LOC_NM,
                ...addDefaults?.(main),
              });
            } else {
              base.addRow(key, { LOC_ID: main.LOC_ID, ...addDefaults?.(main) });
            }
          },
        }),
        makeSaveAction({
          onClick: () =>
            base.saveGrid(key, saveFn, {
              afterSave: {
                cascadeFrom: "main",
                fetch: (parent) => fetchFn(masterParam(parent)),
              },
            }),
        }),
      ];
    });
    return map;
  }, [model.grids.main.selectedRef, base, openPopup, closePopup, setDetailTab]);

  // ── 메인 actions ───────────────────────────────────────────
  // TODO: BTN_VIEW_BY_MAP / BTN_EDIT_LATLON / BTN_ADD_ASSIGNED_VEHICLE / BTN_ADD_ZONE 의 onClick 구현
  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_VIEW_BY_MAP",
        label: "BTN_VIEW_BY_MAP",
        onClick: onViewByMap,
      },
      {
        type: "button",
        key: "BTN_EDIT_LATLON",
        label: "BTN_EDIT_LATLON",
        onClick: onEditLatLon,
      },
      {
        type: "button",
        key: "BTN_ADD_ASSIGNED_VEHICLE",
        label: "BTN_ADD_ASSIGNED_VEHICLE",
        onClick: onAddAssignedVehicle,
      },
      {
        type: "button",
        key: "BTN_ADD_ZONE",
        label: "BTN_ADD_ZONE",
        onClick: onAddZone,
      },
      makeAddAction({ onClick: () => base.addRow("main", {}) }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [
      base,
      onSaveMain,
      onAddAssignedVehicle,
      onAddZone,
      onViewByMap,
      onEditLatLon,
      menuName,
      model.filtersRef,
      model.grids.main,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    subActions,
  };
}
