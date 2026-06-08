"use client";

import { Fragment, useEffect, useState } from "react";
import { X, Check, Truck } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import {
  PopupSearchCondition,
  type GridSearchField,
  type GridSearchInputField,
  type GridSearchPopupField,
} from "@/app/components/popup/PopupSearchCondition";

// 기존 소비자(import type { GridSearchField } from "./GridSearchPopupLayout") 호환 위해 re-export
export type { GridSearchField, GridSearchInputField, GridSearchPopupField };

type GridSearchPopupLayoutProps = {
  fields: GridSearchField[];
  columnDefs: any[];
  rows: any[];
  gridHeight: number;
  selectedBadgeFields: string[];
  selectedLabel?: string;
  /** 그리드 선택 모드 — 자식 팝업에서 지정. 기본 "single".
   *  "multiple" 이면 배지에 선택 다건을 표시하고 onConfirm 에 payload 배열을 전달. */
  rowSelection?: "single" | "multiple";
  onSearch: () => void;
  onConfirm: (payload: Record<string, any> | Record<string, any>[]) => void;
  onClose: () => void;
  codeMap?: any;
};

export function GridSearchPopupLayout({
  fields,
  columnDefs,
  rows,
  gridHeight,
  selectedBadgeFields,
  selectedLabel = "선택됨",
  rowSelection = "single",
  onSearch,
  onConfirm,
  onClose,
  codeMap,
}: GridSearchPopupLayoutProps) {
  const isMultiple = rowSelection === "multiple";
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  // rows ref 가 바뀔 때마다 DataGrid 재마운트 — ag-grid 가 stale row 누적하는 문제 회피
  useEffect(() => {
    setReloadKey((k) => k + 1);
    setSelectedRows([]);
  }, [rows]);

  // columnDefs 의 sendField 매핑 — 도메인 메모 같은 추가 키는 호출측 onConfirm 에서 wrapping
  const buildPayload = (row: any) => {
    return columnDefs.reduce(
      (acc, col) => {
        const sendKey = (col as any).sendField ?? col.field;
        if (sendKey && col.field) {
          acc[sendKey] = row[col.field];
        }
        return acc;
      },
      {} as Record<string, any>,
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* 조회 조건 */}
      <PopupSearchCondition fields={fields} onSearch={onSearch} />

      {/* 선택 상태 표시 */}
      {selectedRows.length > 0 ? (
        isMultiple ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-700 min-w-0">
            <Truck className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
            <span
              className="truncate min-w-0"
              title={selectedRows
                .map((r) => r[selectedBadgeFields[0]])
                .join(", ")}
            >
              {selectedRows
                .map((r) => selectedBadgeFields.map((f) => r[f]).join(" | "))
                .join(", ")}
            </span>
            <span className="ml-auto flex-shrink-0 text-[10px] text-blue-400 font-medium">
              {selectedRows.length}건 {selectedLabel}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-700">
            <Truck className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
            {selectedBadgeFields.map((field, i) => (
              <Fragment key={field}>
                {i > 0 && <span className="text-blue-300">|</span>}
                <span className={i === 0 ? "font-semibold" : undefined}>
                  {selectedRows[0][field]}
                </span>
              </Fragment>
            ))}
            <span className="ml-auto text-[10px] text-blue-400 font-medium">
              {selectedLabel}
            </span>
          </div>
        )
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-[11px] text-slate-400">
          <Truck className="w-3.5 h-3.5 flex-shrink-0" />
          <span>그리드에서 차량을 선택하세요</span>
        </div>
      )}

      {/* Grid — 재조회 시 ag-grid 가 row 누적/잔존하는 문제 회피용 key */}
      <div className="shrink-0" style={{ height: gridHeight }}>
        <DataGrid
          key={reloadKey}
          layoutType="plain"
          actions={[]}
          columnDefs={columnDefs}
          rowData={rows}
          rowSelection={rowSelection}
          codeMap={codeMap}
          onRowSelected={
            isMultiple
              ? undefined
              : (row: any) => setSelectedRows(row ? [row] : [])
          }
          gridOptions={
            isMultiple
              ? {
                  onSelectionChanged: (e: any) =>
                    setSelectedRows(e.api.getSelectedRows()),
                }
              : undefined
          }
          disableAutoSize
        />
      </div>

      {/* 버튼 영역 */}
      <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-100">
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="h-7 px-4 text-xs border-slate-200 text-slate-500 hover:bg-slate-50 gap-1.5"
        >
          <X className="w-3 h-3" />
          취소
        </Button>
        <Button
          size="sm"
          disabled={selectedRows.length === 0}
          onClick={() =>
            onConfirm(
              isMultiple
                ? selectedRows.map(buildPayload)
                : buildPayload(selectedRows[0]),
            )
          }
          className="h-7 px-4 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 gap-1.5"
        >
          <Check className="w-3 h-3" />
          적용
        </Button>
      </div>
    </div>
  );
}
