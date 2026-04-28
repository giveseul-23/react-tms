import { useCallback, MutableRefObject } from "react";
import { locationApi } from "./LocationApi";
import { LocationModel } from "./LocationModel";
import { MAIN_COLUMN_DEFS } from "./LocationColumns";
import {
  makeCommonActions,
  makeExcelGroupAction,
} from "@/app/components/grid/commonActions";

type ControllerProps = {
  model: LocationModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useLocationController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const fetchList = useCallback(
    (params: Record<string, unknown>) => locationApi.getList(params),
    [],
  );

  const fetchSubTabs = useCallback(
    (row: any) => {
      if (!row) return;
      const params = { LOC_ID: row.LOC_ID };

      locationApi
        .getEntryRestrictionList(params)
        .then((res: any) =>
          model.setEntryRestrictionRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      locationApi
        .getAssignedVehicleList(params)
        .then((res: any) =>
          model.setAssignedVehicleRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      locationApi
        .getDateProhibitionList(params)
        .then((res: any) =>
          model.setDateProhibitionRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      locationApi
        .getRegisteredZoneList(params)
        .then((res: any) =>
          model.setRegisteredZoneRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      locationApi
        .getHolidayList(params)
        .then((res: any) =>
          model.setHolidayRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      locationApi
        .getPreferredCarrierList(params)
        .then((res: any) =>
          model.setPreferredCarrierRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      locationApi
        .getArrivalRequestTimeList(params)
        .then((res: any) =>
          model.setArrivalRequestTimeRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      locationApi
        .getSmsList(params)
        .then((res: any) =>
          model.setSmsRowData(res.data.result ?? res.data.data?.dsOut ?? []),
        );
      locationApi
        .getLocationRoleList(params)
        .then((res: any) =>
          model.setLocationRoleRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      locationApi
        .getLocSalesList(params)
        .then((res: any) =>
          model.setLocSalesRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
      locationApi
        .getEtcList(params)
        .then((res: any) =>
          model.setEtcRowData(res.data.result ?? res.data.data?.dsOut ?? []),
        );
      locationApi
        .getOrderTypePlanIdList(params)
        .then((res: any) =>
          model.setOrderTypePlanIdRowData(
            res.data.result ?? res.data.data?.dsOut ?? [],
          ),
        );
    },
    [model],
  );

  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);
      fetchSubTabs(row);
    },
    [model, fetchSubTabs],
  );

  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
      model.resetSubGrids();
      handleRowClicked(data.rows?.[0]);
    },
    [model, handleRowClicked],
  );

  const mainActions = [
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
          const saveRows = (e.data ?? []).filter(
            (r: any) => r._isNew || r._isDirty,
          );
          if (saveRows.length === 0) return;
          locationApi.save(saveRows).then(() => searchRef.current?.());
        },
      },
      excel: {
        columns: MAIN_COLUMN_DEFS,
        menuName: "착지관리",
        fetchFn: () => locationApi.getList(filtersRef.current),
        rows: model.gridData.rows,
      },
    }),
  ];

  const subActions = makeCommonActions({
    add: true,
    save: true,
    excel: {
      columns: [],
      menuName: "착지관리",
      fetchFn: () => Promise.resolve({ data: { rows: [] } } as any),
      rows: [],
    },
  });

  return {
    fetchList,
    handleSearch,
    handleRowClicked,
    mainActions,
    subActions,
  };
}
