// src/views/tender/TenderReceiveDispatch.tsx
"use client";

import { useState } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

import { SearchFilters } from "@/app/components/SearchFilters";
import DataGrid from "@/app/components/grid/DataGrid";

type LayoutType = "side" | "vertical";

const actions1 = [
  {
    type: "group",
    key: "add",
    label: "BTN GROUPING",
    items: [
      {
        type: "button",
        key: "b1",
        label: "BTN1",
        onClick: () => console.log("BTN1"),
      },
      {
        type: "button",
        key: "b2",
        label: "BTN2",
        onClick: () => console.log("BTN2"),
      },
    ],
  },
  {
    type: "button",
    key: "refresh",
    label: "BTN1",
    onClick: () => console.log("refresh"),
  },
];

export default function TenderReceiveDispatch() {
  const [layout, setLayout] = useState<LayoutType>("side");

  return (
    <div className="flex flex-col gap-3 h-full min-h-0 min-w-0">
      {/* 조회 조건 */}
      <SearchFilters />

      {/* layout toggle */}
      <div className="shrink-0 flex items-center justify-between text-[13px] text-[rgb(var(--fg))]">
        <span>Showing</span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setLayout("vertical")}
            className="h-[30px] w-[34px] rounded-md border border-slate-200 bg-[rgb(var(--bg))] text-[rgb(var(--fg))]"
          >
            ⬇
          </button>
          <button
            type="button"
            onClick={() => setLayout("side")}
            className="h-[30px] w-[34px] rounded-md border border-slate-200 bg-[rgb(var(--bg))] text-[rgb(var(--fg))]"
          >
            ➡
          </button>
        </div>
      </div>

      {/* grid area */}
      <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
        <PanelGroup
          direction={layout === "side" ? "horizontal" : "vertical"}
          className="h-full w-full min-h-0 min-w-0 overflow-hidden"
        >
          <Panel defaultSize={50} minSize={20} className="min-h-0 min-w-0">
            <div className="h-full flex flex-col overflow-hidden">
              <DataGrid
                layoutType="plain"
                columnDefs={[
                  { headerName: "No", width: 60 },
                  { headerName: "배차번호", field: "DSPCH_NO", width: 130 },
                ]}
                rowData={[{ DSPCH_NO: 1 }]}
                actions={actions1}
              />
            </div>
          </Panel>

          <PanelResizeHandle
            className={
              layout === "side"
                ? "w-2 cursor-col-resize hover:bg-slate-200/70"
                : "h-2 cursor-row-resize hover:bg-slate-200/70"
            }
          />

          <Panel defaultSize={50} minSize={20} className="min-h-0 min-w-0">
            <div className="h-full flex flex-col overflow-hidden">
              <DataGrid
                layoutType="tab"
                tabs={[
                  { key: "ALL", label: "전체" },
                  { key: "WAIT", label: "대기" },
                  { key: "DONE", label: "완료" },
                ]}
                presets={{
                  ALL: {
                    columnDefs: [
                      { headerName: "No", width: 60 },
                      { headerName: "배차번호", field: "DSPCH_NO", width: 130 },
                    ],
                    rowData: [{ DSPCH_NO: 1 }],
                  },
                  WAIT: {
                    columnDefs: [
                      { headerName: "No", width: 60 },
                      { headerName: "배차번호", field: "DSPCH_NO", width: 130 },
                      { headerName: "상태", field: "STATUS", width: 100 },
                    ],
                    rowData: [{ DSPCH_NO: 2, STATUS: "대기" }],
                  },
                  DONE: {
                    columnDefs: [
                      { headerName: "No", width: 60 },
                      { headerName: "배차번호", field: "DSPCH_NO", width: 130 },
                      { headerName: "완료시간", field: "DONE_DT", width: 160 },
                    ],
                    rowData: [{ DSPCH_NO: 3, DONE_DT: "2026-01-28" }],
                  },
                }}
                rowData={[{ DSPCH_NO: 1 }, { DSPCH_NO: 2 }]}
              />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
