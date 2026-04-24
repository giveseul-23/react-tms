"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

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
  const { meta, loading } = useSearchMeta(MENU_CD);
  const model = useLocationModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  const ctrl = useLocationController({
    model,
    searchRef,
    filtersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <MasterDetailPage
      searchProps={{
        meta,
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        pageSize: model.pageSize,
        excludeKeysRef,
        menuCode: MENU_CD,
      }}
      direction={model.layout === "side" ? "horizontal" : "vertical"}
      layoutToggle={{
        layout: model.layout,
        onToggle: () =>
          model.setLayout((prev: LayoutType) =>
            prev === "side" ? "vertical" : "side",
          ),
      }}
      storageKey="location"
      master={
        <DataGrid
          layoutType="plain"
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          rowData={model.gridData.rows}
          totalCount={model.gridData.totalCount}
          currentPage={model.gridData.page}
          pageSize={model.pageSize}
          onPageSizeChange={model.setPageSize}
          onPageChange={(page) => {
            model.resetSubGrids();
            searchRef.current?.(page);
          }}
          onRowClicked={ctrl.handleRowClicked}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "ENTRY_RESTRICTION", label: "진입제약" },
            { key: "ASSIGNED_VEHICLE", label: "지정차량" },
            { key: "DATE_PROHIBITION", label: "입차금지" },
            { key: "REGISTERED_ZONE", label: "등록권역" },
            { key: "HOLIDAY", label: "휴무일" },
            { key: "PREFERRED_CARRIER", label: "선호운송협력사" },
            { key: "ARRIVAL_REQUEST_TIME", label: "도착요구시간관리" },
            { key: "SMS", label: "SMS" },
            { key: "LOCATION_ROLE", label: "착지역할" },
            { key: "LOC_SALES", label: "LBL_LOC_SALES" },
            { key: "ETC", label: "기타" },
            { key: "ORDER_TYPE_PLAN_ID", label: "주문유형별계획ID" },
          ]}
          presets={{
            ENTRY_RESTRICTION: {
              columnDefs: ENTRY_RESTRICTION_COLUMN_DEFS,
              actions: ctrl.subActions,
            },
            ASSIGNED_VEHICLE: {
              columnDefs: ASSIGNED_VEHICLE_COLUMN_DEFS,
              actions: ctrl.subActions,
            },
            DATE_PROHIBITION: {
              columnDefs: EXCLD_VEH_COLUMN_DEFS,
              actions: ctrl.subActions,
            },
            REGISTERED_ZONE: {
              columnDefs: REGISTERED_ZONE_COLUMN_DEFS,
              actions: ctrl.subActions,
            },
            HOLIDAY: {
              columnDefs: HOLIDAY_COLUMN_DEFS,
              actions: ctrl.subActions,
            },
            PREFERRED_CARRIER: {
              columnDefs: PREFERRED_CARRIER_COLUMN_DEFS,
              actions: ctrl.subActions,
            },
            ARRIVAL_REQUEST_TIME: {
              columnDefs: ARRIVAL_REQUEST_TIME_COLUMN_DEFS,
              actions: ctrl.subActions,
            },
            SMS: {
              columnDefs: SMS_COLUMN_DEFS,
              actions: ctrl.subActions,
            },
            LOCATION_ROLE: {
              columnDefs: LOCATION_ROLE_COLUMN_DEFS,
              actions: ctrl.subActions,
            },
            LOC_SALES: {
              columnDefs: LOC_SALES_COLUMN_DEFS,
              actions: ctrl.subActions,
            },
            ETC: {
              columnDefs: ETC_COLUMN_DEFS,
              actions: ctrl.subActions,
            },
            ORDER_TYPE_PLAN_ID: {
              columnDefs: ORDER_TYPE_PLAN_ID_COLUMN_DEFS,
              actions: ctrl.subActions,
            },
          }}
          rowData={{
            ENTRY_RESTRICTION: model.entryRestrictionRowData,
            ASSIGNED_VEHICLE: model.assignedVehicleRowData,
            DATE_PROHIBITION: model.dateProhibitionRowData,
            REGISTERED_ZONE: model.registeredZoneRowData,
            HOLIDAY: model.holidayRowData,
            PREFERRED_CARRIER: model.preferredCarrierRowData,
            ARRIVAL_REQUEST_TIME: model.arrivalRequestTimeRowData,
            SMS: model.smsRowData,
            LOCATION_ROLE: model.locationRoleRowData,
            LOC_SALES: model.locSalesRowData,
            ETC: model.etcRowData,
            ORDER_TYPE_PLAN_ID: model.orderTypePlanIdRowData,
          }}
          codeMap={model.codeMap}
          actions={[]}
        />
      }
    />
  );
}
