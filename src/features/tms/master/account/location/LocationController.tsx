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

const masterParam = (row: any) => ({ LOC_ID: row?.LOC_ID });

type SubKey = Exclude<GridKey, "main">;

// sub 그리드별 ─ fetch / save 매핑 (cascade 재조회 + 저장)
// TODO: 각 save 의 실제 endpoint 와 신규행 기본값은 LocationApi.ts / 비즈니스 로직에 맞춰 사용자가 보강
const SUB_CONFIG: Array<{
  key: SubKey;
  parentLabel: string;
  saveFn: (p: { dsSave: any[] }) => Promise<any>;
  fetchFn: (p: any) => Promise<any>;
}> = [
  { key: "entryRestriction",   parentLabel: "착지", saveFn: api.saveEntryRestriction,   fetchFn: api.getEntryRestrictionList },
  { key: "assignedVehicle",    parentLabel: "착지", saveFn: api.saveAssignedVehicle,    fetchFn: api.getAssignedVehicleList },
  { key: "dateProhibition",    parentLabel: "착지", saveFn: api.saveDateProhibition,    fetchFn: api.getDateProhibitionList },
  { key: "registeredZone",     parentLabel: "착지", saveFn: api.saveRegisteredZone,     fetchFn: api.getRegisteredZoneList },
  { key: "holiday",            parentLabel: "착지", saveFn: api.saveHoliday,            fetchFn: api.getHolidayList },
  { key: "preferredCarrier",   parentLabel: "착지", saveFn: api.savePreferredCarrier,   fetchFn: api.getPreferredCarrierList },
  { key: "arrivalRequestTime", parentLabel: "착지", saveFn: api.saveArrivalRequestTime, fetchFn: api.getArrivalRequestTimeList },
  { key: "sms",                parentLabel: "착지", saveFn: api.saveSms,                fetchFn: api.getSmsList },
  { key: "locationRole",       parentLabel: "착지", saveFn: api.saveLocationRole,       fetchFn: api.getLocationRoleList },
  { key: "locSales",           parentLabel: "착지", saveFn: api.saveLocSales,           fetchFn: api.getLocSalesList },
  { key: "etc",                parentLabel: "착지", saveFn: api.saveEtc,                fetchFn: api.getEtcList },
  { key: "orderTypePlanId",    parentLabel: "착지", saveFn: api.saveOrderTypePlanId,    fetchFn: api.getOrderTypePlanIdList },
];

interface Args {
  model: LocationModel;
}

export function useLocationController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // ── 메인 fetch ─────────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // ── 메인 클릭 → 12개 sub cascade ───────────────────────────
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick(
        "main",
        row,
        SUB_CONFIG.map(({ key, fetchFn }) => ({
          to: key,
          fetch: (r: any) => fetchFn(masterParam(r)),
        })),
      ),
    [base],
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
        confirmOnDelete: "삭제된 항목이 있습니다. 계속 진행하시겠습니까?",
      }),
    [base],
  );

  // ── 12개 sub actions 일괄 생성 ─────────────────────────────
  // 각 sub: Add (LOC_ID 자동 채움) + Save (main cascade 재조회).
  // TODO: 신규행 기본값은 sub 별로 더 채워야 할 수 있음 (예: 코드 기본값, 시퀀스 등).
  const subActions = useMemo(() => {
    const map = {} as Record<SubKey, ActionItem[]>;
    SUB_CONFIG.forEach(({ key, parentLabel, saveFn, fetchFn }) => {
      map[key] = [
        makeAddAction({
          onClick: () => {
            const main = model.grids.main.selectedRef.current;
            if (!base.requireParentRow(main, parentLabel)) return;
            base.addRow(key, { LOC_ID: main.LOC_ID });
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
  }, [model, base]);

  // ── 메인 actions ───────────────────────────────────────────
  // TODO: BTN_VIEW_BY_MAP / BTN_EDIT_LATLON / BTN_ADD_ASSIGNED_VEHICLE / BTN_ADD_ZONE 의 onClick 구현
  const mainActions: ActionItem[] = useMemo(
    () => [
      { type: "button", key: "BTN_VIEW_BY_MAP",          label: "BTN_VIEW_BY_MAP",          onClick: () => {} },
      { type: "button", key: "BTN_EDIT_LATLON",          label: "BTN_EDIT_LATLON",          onClick: () => {} },
      { type: "button", key: "BTN_ADD_ASSIGNED_VEHICLE", label: "BTN_ADD_ASSIGNED_VEHICLE", onClick: () => {} },
      { type: "button", key: "BTN_ADD_ZONE",             label: "BTN_ADD_ZONE",             onClick: () => {} },
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
    [base, onSaveMain, model.filtersRef, model.grids.main.rows],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    subActions,
  };
}
