"use client";

import { Fragment, useEffect, useState } from "react";
import { Search, X, Check, Truck, SlidersHorizontal } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { ComboFilter } from "@/app/components/Search/filters/ComboFilter";

type GridSearchFieldBase = {
  label: string;
  placeholder?: string;
  /** true 면 타입 불문 화면에서 값 수정 불가 (조회 스코프 고정 등) */
  disable?: boolean;
};

export type GridSearchInputField = GridSearchFieldBase & {
  type?: "text" | "combo";
  value: string;
  onChange: (v: string) => void;
  options?: { CODE: string; NAME: string }[];
};

/** 메인 조회조건 popup 타입처럼 코드+코드명 둘 다 표시 + 돋보기.
 *  picker 는 화면이 onClickSearch 로 제공 (disable 이면 돋보기 비활성). */
export type GridSearchPopupField = GridSearchFieldBase & {
  type: "popup";
  code: string;
  name: string;
  onChangeCode?: (v: string) => void;
  onChangeName?: (v: string) => void;
  onClickSearch?: () => void;
  onEnterSubmit?: (code: string, name: string) => void;
};

export type GridSearchField = GridSearchInputField | GridSearchPopupField;

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

        <div
          className="grid divide-x divide-y divide-slate-100"
          style={{
            gridTemplateColumns: `repeat(${Math.min(fields.length, 3)}, minmax(0, 1fr))`,
          }}
        >
          {fields.map((f) => (
            <div
              key={f.label}
              className="flex flex-col px-3 py-2 bg-white hover:bg-blue-50/40 transition-colors group"
            >
              <label className="text-[10px] font-medium text-slate-400 mb-0.5 group-focus-within:text-blue-500 transition-colors">
                {f.label}
              </label>
              {f.type === "popup" ? (
                <div className="flex items-center gap-1.5 w-full min-w-0">
                  <input
                    value={f.code}
                    onChange={(e) => f.onChangeCode?.(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      if (f.onEnterSubmit)
                        f.onEnterSubmit(e.currentTarget.value, "");
                      else onSearch();
                    }}
                    disabled={f.disable}
                    className="text-[12px] text-slate-700 bg-transparent outline-none border-none placeholder:text-slate-300 w-[80px] shrink-0 disabled:cursor-not-allowed disabled:text-slate-400"
                    placeholder="코드"
                  />
                  <span className="text-slate-200">|</span>
                  <input
                    value={f.name}
                    onChange={(e) => f.onChangeName?.(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      if (f.onEnterSubmit)
                        f.onEnterSubmit("", e.currentTarget.value);
                      else onSearch();
                    }}
                    disabled={f.disable}
                    className="text-[12px] text-slate-700 bg-transparent outline-none border-none placeholder:text-slate-300 flex-1 min-w-0 disabled:cursor-not-allowed disabled:text-slate-400"
                    placeholder="코드명"
                  />
                  <button
                    type="button"
                    onClick={f.onClickSearch}
                    disabled={f.disable}
                    className="shrink-0 text-slate-400 hover:text-[rgb(var(--primary))] transition-colors disabled:cursor-not-allowed disabled:text-slate-300"
                    aria-label="검색"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : f.type === "combo" ? (
                <ComboFilter
                  placeholder={f.placeholder ?? "선택"}
                  options={f.options ?? []}
                  value={f.value}
                  onChange={f.onChange}
                  disabled={f.disable}
                  inputClassName="text-[12px] text-slate-700 bg-transparent outline-none border-none h-auto p-0"
                />
              ) : (
                <input
                  value={f.value}
                  onChange={(e) => f.onChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSearch()}
                  disabled={f.disable}
                  className="text-[12px] text-slate-700 bg-transparent outline-none border-none placeholder:text-slate-300 w-full disabled:cursor-not-allowed disabled:text-slate-400"
                  placeholder={f.placeholder ?? "입력"}
                />
              )}
            </div>
          ))}
        </div>
      </div>

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
