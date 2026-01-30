"use client";

import React, { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { SquarePlus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import type {
  ColDef,
  ColGroupDef,
  GridReadyEvent,
  ValueGetterParams,
  ValueFormatterParams,
  ICellRendererParams,
} from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import {
  GridActionsBar,
  type ActionItem,
} from "@/app/components/ui/GridActionsBar";

ModuleRegistry.registerModules([AllCommunityModule]);

export type OrderRow = {
  STATUS?: string;
  LGST_GRP_CD?: string;
  DLVRY_DT?: string;
  DSPCH_NO?: string | number;
  DSPCH_OP_STS?: string;
  CARR_NM?: string;
  VEH_TP_NM?: string;
  VEH_NO?: string;
  DRVR_NM?: string;
  PHN_NO?: string;
  price?: number;
  [key: string]: unknown;
};

type OrdersHeaderGridProps = {
  rowData: OrderRow[];
  onSelectOrder?: (row: OrderRow) => void;

  /** tab: 탭 보임 + 라운드 카드 / plain: 탭 없이 기존 스타일 */
  layoutType?: "tab" | "plain";

  /** 그리드 최소 높이(없으면 420) */
  gridHeightPx?: number;
  actions: ActionItem[];
};

const StatusBadge: React.FC<ICellRendererParams<OrderRow, unknown>> = (
  props,
) => {
  const v = props.value;
  if (!v) return null;
  const text = String(v);
  return <span className={`badge ${text.toLowerCase()}`}>{text}</span>;
};

type TabKey = "images" | "videos" | "stores" | "settings" | "profile" | "tools";

const TABS: { key: TabKey; label: string }[] = [
  { key: "images", label: "Images" },
  { key: "videos", label: "Videos" },
  { key: "stores", label: "Stores" },
  { key: "settings", label: "Settings" },
  { key: "profile", label: "Profile" },
  { key: "tools", label: "Tools" },
];

function UnderlineTabs({
  activeTab,
  onChange,
}: {
  activeTab: TabKey;
  onChange: (k: TabKey) => void;
}) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex items-center gap-8">
        {TABS.map((t) => {
          const active = t.key === activeTab;

          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={[
                "relative py-3 text-sm",
                active
                  ? "text-gray-900 font-medium"
                  : "text-gray-400 hover:text-gray-700",
              ].join(" ")}
            >
              {t.label}
              {/* ✅ 밑줄은 파란색 */}
              <span
                className={[
                  "absolute left-0 -bottom-[1px] h-[2px] w-full transition-opacity",
                  active ? "opacity-100 bg-blue-600" : "opacity-0",
                ].join(" ")}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function OrdersHeaderGrid({
  rowData,
  onSelectOrder,
  layoutType = "tab",
  gridHeightPx,
  actions,
}: OrdersHeaderGridProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  const columnDefs = useMemo<(ColDef<OrderRow> | ColGroupDef<OrderRow>)[]>(
    () => [
      {
        headerName: "No",
        width: 60,
        valueGetter: (params: ValueGetterParams<OrderRow>) => {
          const api = params.api as any;
          const pageSize =
            typeof api?.paginationGetPageSize === "function"
              ? api.paginationGetPageSize() || 10
              : 10;
          const currentPage =
            typeof api?.paginationGetCurrentPage === "function"
              ? api.paginationGetCurrentPage() || 0
              : 0;

          const rowIndex = params.node?.rowIndex ?? 0;
          return currentPage * pageSize + rowIndex + 1;
        },
      },
      {
        headerName: "",
        field: "STATUS",
        width: 130,
        cellRenderer: StatusBadge,
      },
      { headerName: "물류운영그룹", field: "LGST_GRP_CD", width: 120 },
      { headerName: "납품일", field: "DLVRY_DT", width: 140 },
      { headerName: "배차번호", field: "DSPCH_NO", width: 130 },
      { headerName: "배차진행상태", field: "DSPCH_OP_STS", width: 130 },
      { headerName: "운송협력사명", field: "CARR_NM", width: 130 },
      { headerName: "차량유형명", field: "VEH_TP_NM", width: 130 },
      { headerName: "차량번호", field: "VEH_NO", width: 130 },
      { headerName: "운전자명", field: "DRVR_NM", width: 130 },
      { headerName: "핸드폰번호", field: "PHN_NO", width: 130 },
      {
        headerName: "Price",
        field: "price",
        width: 120,
        cellClass: "cell-right",
        valueFormatter: (p: ValueFormatterParams<OrderRow, number>) =>
          p.value != null ? `$${Number(p.value).toLocaleString()}` : "",
      },
    ],
    [],
  );

  const rowSelection = useMemo(
    () => ({
      mode: "multiRow" as const,
      enableClickSelection: true,
      enableSelectionWithoutKeys: true,
    }),
    [],
  );

  // ✅ grid는 반드시 높이 있는 컨테이너에서 렌더
  const Grid = (
    <div className="w-full h-full min-h-0">
      <div className="ag-theme-quartz w-full h-full min-h-0">
        <AgGridReact<OrderRow>
          theme="legacy"
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{ resizable: true, sortable: true }}
          rowSelection={rowSelection as any}
          suppressRowDeselection={false}
          suppressCellFocus={true}
          headerHeight={36}
          rowHeight={40}
          onGridReady={(params: GridReadyEvent<OrderRow>) => {
            requestAnimationFrame(() => params.api.sizeColumnsToFit());
          }}
        />
      </div>
    </div>
  );

  // ✅ plain: 기존처럼(탭 없음 / 카드 없음)
  if (layoutType === "plain") {
    return (
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden flex flex-col h-full min-h-0">
        <GridActionsBar actions={actions} />

        {/* ✅ 여기만 변경: height 고정 / fill 분기 */}
        <div
          className={gridHeightPx ? "px-0" : "px-0 flex-1 min-h-0"}
          style={gridHeightPx ? { height: gridHeightPx } : undefined}
        >
          {Grid}
        </div>
      </div>
    );
  }

  // ✅ tab: 라운드 카드(회색 얇은 선 + 흰 배경) 안에
  //     tab -> action btn -> grid 순서로 배치
  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden flex flex-col h-full min-h-0">
      {/* tab */}
      <div className="px-4">
        <UnderlineTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* action btn */}
      <GridActionsBar actions={actions} />

      {/* ✅ 여기만 변경: height 고정 / fill 분기 */}
      <div
        className={gridHeightPx ? "px-0 min-h-0" : "px-0 min-h-0 flex-1"}
        style={gridHeightPx ? { height: gridHeightPx } : undefined}
      >
        {Grid}
      </div>
    </div>
  );
}
