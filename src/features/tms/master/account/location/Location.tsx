"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useLocationModel } from "./LocationModel";
import { useLocationController } from "./LocationController";
import {
  MAIN_COLUMN_DEFS,
  ENTRY_RESTRICTION_COLUMN_DEFS,
  ASSIGNED_VEHICLE_COLUMN_DEFS,
  EXCLD_VEH_COLUMN_DEFS,
  REGISTERED_ZONE_COLUMN_DEFS,
  HOLIDAY_COLUMN_DEFS,
  PREFERRED_CARRIER_COLUMN_DEFS,
  ARRIVAL_REQUEST_TIME_COLUMN_DEFS,
  SMS_COLUMN_DEFS,
  LOCATION_ROLE_COLUMN_DEFS,
  LOC_SALES_COLUMN_DEFS,
  ETC_COLUMN_DEFS,
  ORDER_TYPE_PLAN_ID_COLUMN_DEFS,
} from "./LocationColumns";

export const MENU_CD = "MENU_LOCATION_MANAGER";

export default function Location() {
  const model = useLocationModel(MENU_CD);
  const ctrl = useLocationController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CD}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
      }}
      defaultDirection="vertical"
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "ENTRY_RESTRICTION", label: "LBL_RESTRICTED_VEHICLE_TYPE" },
            { key: "ASSIGNED_VEHICLE", label: "LBL_ASSIGNED_VEHICLE" },
            { key: "DATE_PROHIBITION", label: "LBL_LOC_EXCLD_VEH" },
            { key: "REGISTERED_ZONE", label: "LBL_LOCATION_ZONE" },
            { key: "HOLIDAY", label: "LBL_CLOSED_DAY" },
            { key: "PREFERRED_CARRIER", label: "LBL_PREFERRED_CARRIER" },
            { key: "ARRIVAL_REQUEST_TIME", label: "LBL_DELIVERY_TIME_WINDOW" },
            { key: "SMS", label: "LBL_SMS" },
            { key: "LOCATION_ROLE", label: "LBL_LOC_ROLE_TP" },
            { key: "LOC_SALES", label: "LBL_LOC_SALES" },
            { key: "ETC", label: "LBL_ETC_SETTING" },
            { key: "ORDER_TYPE_PLAN_ID", label: "LBL_LOC_ORD_PLN" },
          ]}
          presets={{
            ENTRY_RESTRICTION: {
              render: () => (
                <DataGrid
                  {...model.bind("entryRestriction")}
                  columnDefs={ENTRY_RESTRICTION_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.subActions.entryRestriction}
                />
              ),
            },
            ASSIGNED_VEHICLE: {
              render: () => (
                <DataGrid
                  {...model.bind("assignedVehicle")}
                  columnDefs={ASSIGNED_VEHICLE_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.subActions.assignedVehicle}
                />
              ),
            },
            DATE_PROHIBITION: {
              render: () => (
                <DataGrid
                  {...model.bind("dateProhibition")}
                  columnDefs={EXCLD_VEH_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.subActions.dateProhibition}
                />
              ),
            },
            REGISTERED_ZONE: {
              render: () => (
                <DataGrid
                  {...model.bind("registeredZone")}
                  columnDefs={REGISTERED_ZONE_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.subActions.registeredZone}
                />
              ),
            },
            HOLIDAY: {
              render: () => (
                <DataGrid
                  {...model.bind("holiday")}
                  columnDefs={HOLIDAY_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.subActions.holiday}
                />
              ),
            },
            PREFERRED_CARRIER: {
              render: () => (
                <DataGrid
                  {...model.bind("preferredCarrier")}
                  columnDefs={PREFERRED_CARRIER_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.subActions.preferredCarrier}
                />
              ),
            },
            ARRIVAL_REQUEST_TIME: {
              render: () => (
                <DataGrid
                  {...model.bind("arrivalRequestTime")}
                  columnDefs={ARRIVAL_REQUEST_TIME_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.subActions.arrivalRequestTime}
                />
              ),
            },
            SMS: {
              render: () => (
                <DataGrid
                  {...model.bind("sms")}
                  columnDefs={SMS_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.subActions.sms}
                />
              ),
            },
            LOCATION_ROLE: {
              render: () => (
                <DataGrid
                  {...model.bind("locationRole")}
                  columnDefs={LOCATION_ROLE_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.subActions.locationRole}
                />
              ),
            },
            LOC_SALES: {
              render: () => (
                <DataGrid
                  {...model.bind("locSales")}
                  columnDefs={LOC_SALES_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.subActions.locSales}
                />
              ),
            },
            ETC: {
              render: () => (
                <DataGrid
                  {...model.bind("etc")}
                  columnDefs={ETC_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.subActions.etc}
                />
              ),
            },
            ORDER_TYPE_PLAN_ID: {
              render: () => (
                <DataGrid
                  {...model.bind("orderTypePlanId")}
                  columnDefs={ORDER_TYPE_PLAN_ID_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.subActions.orderTypePlanId}
                />
              ),
            },
          }}
          actions={[]}
        />
      }
    />
  );
}
