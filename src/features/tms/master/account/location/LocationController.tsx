import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { locationApi as api } from "./LocationApi";
import { MAIN_COLUMN_DEFS } from "./LocationColumns";
import {
  makeCommonActions,
} from "@/app/components/grid/commonActions";
import { dirtyRows } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { LocationModel, GridKey } from "./LocationModel";

const masterParam = (row: any) => ({ LOC_ID: row?.LOC_ID });

interface Args {
  model: LocationModel;
}

export function useLocationController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // master 클릭 → 12개 sub 동시 fetch
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "entryRestriction",
          fetch: (r) => api.getEntryRestrictionList(masterParam(r)),
        },
        {
          to: "assignedVehicle",
          fetch: (r) => api.getAssignedVehicleList(masterParam(r)),
        },
        {
          to: "dateProhibition",
          fetch: (r) => api.getDateProhibitionList(masterParam(r)),
        },
        {
          to: "registeredZone",
          fetch: (r) => api.getRegisteredZoneList(masterParam(r)),
        },
        { to: "holiday", fetch: (r) => api.getHolidayList(masterParam(r)) },
        {
          to: "preferredCarrier",
          fetch: (r) => api.getPreferredCarrierList(masterParam(r)),
        },
        {
          to: "arrivalRequestTime",
          fetch: (r) => api.getArrivalRequestTimeList(masterParam(r)),
        },
        { to: "sms", fetch: (r) => api.getSmsList(masterParam(r)) },
        {
          to: "locationRole",
          fetch: (r) => api.getLocationRoleList(masterParam(r)),
        },
        { to: "locSales", fetch: (r) => api.getLocSalesList(masterParam(r)) },
        { to: "etc", fetch: (r) => api.getEtcList(masterParam(r)) },
        {
          to: "orderTypePlanId",
          fetch: (r) => api.getOrderTypePlanIdList(masterParam(r)),
        },
      ]),
    [base],
  );

  const handleSearch = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_VIEW_BY_MAP",
        label: "BTN_VIEW_BY_MAP",
        onClick: () => {},
      },
      {
        type: "button",
        key: "BTN_EDIT_LATLON",
        label: "BTN_EDIT_LATLON",
        onClick: () => {},
      },
      {
        type: "button",
        key: "BTN_ADD_ASSIGNED_VEHICLE",
        label: "BTN_ADD_ASSIGNED_VEHICLE",
        onClick: () => {},
      },
      {
        type: "button",
        key: "BTN_ADD_ZONE",
        label: "BTN_ADD_ZONE",
        onClick: () => {},
      },
      ...makeCommonActions({
        add: true,
        save: {
          onClick: (e: any) => {
            const saveRows = dirtyRows(e.data);
            if (saveRows.length === 0) return;
            api.save(saveRows).then(() => model.searchRef.current?.());
          },
        },
        excel: {
          columns: MAIN_COLUMN_DEFS,
          menuName: "착지관리",
          fetchFn: () => api.getList(model.filtersRef.current),
          rows: model.grids.main.rows,
        },
      }),
    ],
    [model],
  );

  const subActions = useMemo(
    () =>
      makeCommonActions({
        add: true,
        save: true,
        excel: {
          columns: [],
          menuName: "착지관리",
          fetchFn: () => Promise.resolve({ data: { rows: [] } } as any),
          rows: [],
        },
      }),
    [],
  );

  return {
    fetchList,
    handleSearch,
    onMainGridClick,
    mainActions,
    subActions,
  };
}
