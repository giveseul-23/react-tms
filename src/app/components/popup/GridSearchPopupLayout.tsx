"use client";

import { useEffect, useState } from "react";
import { Search, X, Check, Truck, SlidersHorizontal } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { ComboFilter } from "@/app/components/Search/filters/ComboFilter";

export type GridSearchField = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "combo";
  options?: { CODE: string; NAME: string }[];
  placeholder?: string;
};

type GridSearchPopupLayoutProps = {
  fields: GridSearchField[];
  columnDefs: any[];
  rows: any[];
  gridHeight: number;
  selectedBadgeFields: [string, string, string];
  selectedLabel?: string;
  onSearch: () => void;
  onConfirm: (payload: Record<string, any>) => void;
  onClose: () => void;
};

export function GridSearchPopupLayout({
  fields,
  columnDefs,
  rows,
  gridHeight,
  selectedBadgeFields,
  selectedLabel = "선택됨",
  onSearch,
  onConfirm,
  onClose,
}: GridSearchPopupLayoutProps) {
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // 호출측에서 배열 아닌 값을 setRows 한 경우 방어
  const safeRows = Array.isArray(rows) ? rows : [];

  // rows ref 가 바뀔 때마다 DataGrid 재마운트 — ag-grid 가 stale row 누적하는 문제 회피
  useEffect(() => {
    setReloadKey((k) => k + 1);
    setSelectedRow(null);
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

  const [f0, f1, f2] = selectedBadgeFields;

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* 조회 조건 */}
      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-3 py-2 bg-[var(--grid-header-bg)]">
          <div className="flex items-center gap-1.5 leading-none">
            <SlidersHorizontal className="w-3.5 h-3.5 text-color/80 flex-shrink-0" />
            <span className="text-[12px] font-semibold text-color tracking-widest uppercase leading-none">
              조회조건
            </span>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={onSearch}
            className="h-6 px-3 rounded-full bg-white/15 hover:bg-white border border-white/30 text-color hover:text-[rgb(var(--primary))] text-[12px] font-semibold transition-all flex items-center gap-1"
            style={{ lineHeight: 1 }}
          >
            <Search className="w-3 h-3 flex-shrink-0" />
            <span className="leading-none">조회</span>
          </Button>
        </div>

        <div className="grid grid-cols-3 divide-x divide-y divide-slate-100">
          {fields.map((f) => (
            <div
              key={f.label}
              className="flex flex-col px-3 py-2 bg-white hover:bg-blue-50/40 transition-colors group"
            >
              <label className="text-[10px] font-medium text-slate-400 mb-0.5 group-focus-within:text-blue-500 transition-colors">
                {f.label}
              </label>
              {f.type === "combo" ? (
                <ComboFilter
                  placeholder={f.placeholder ?? "선택"}
                  options={f.options ?? []}
                  value={f.value}
                  onChange={f.onChange}
                  inputClassName="text-[12px] text-slate-700 bg-transparent outline-none border-none h-auto p-0"
                />
              ) : (
                <input
                  value={f.value}
                  onChange={(e) => f.onChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSearch()}
                  className="text-[12px] text-slate-700 bg-transparent outline-none border-none placeholder:text-slate-300 w-full"
                  placeholder={f.placeholder ?? "입력"}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 선택 상태 표시 */}
      {selectedRow ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-700">
          <Truck className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
          <span className="font-semibold">{selectedRow[f0]}</span>
          <span className="text-blue-300">|</span>
          <span>{selectedRow[f1]}</span>
          <span className="text-blue-300">|</span>
          <span>{selectedRow[f2]}</span>
          <span className="ml-auto text-[10px] text-blue-400 font-medium">
            {selectedLabel}
          </span>
        </div>
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
          rowData={safeRows}
          rowSelection="single"
          onRowSelected={(row: any) => setSelectedRow(row)}
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
          disabled={!selectedRow}
          onClick={() => onConfirm(buildPayload(selectedRow))}
          className="h-7 px-4 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 gap-1.5"
        >
          <Check className="w-3 h-3" />
          적용
        </Button>
      </div>
    </div>
  );
}
