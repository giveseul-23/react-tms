"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, SlidersHorizontal, Check, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { commonApi } from "@/app/services/common/commonApi";
import DataGrid from "@/app/components/grid/DataGrid";

/* =======================
 * Component
 * ======================= */
export function CommonPopup({
  sqlId,
  fetchFn,
  onApply,
  onClose,
  filterCol = "",
  filterValue = "",
  extraParams,
  initialCode = "",
  initialName = "",
  rowSelection = "single",
}: {
  sqlId?: string;
  fetchFn?: (params?: any) => Promise<any>;
  onApply: (row: any) => void;
  onClose: () => void;
  /** 그리드 선택 모드 — 기본 "single". "multiple" 이면 배지에 다건 표시 + onApply 에 행 배열 전달. */
  rowSelection?: "single" | "multiple";
  /** 결과 필터 컬럼 — 비우면 필터 미적용 */
  filterCol?: string;
  /** 결과 필터 값 — filterCol 과 함께 사용 */
  filterValue?: string;
  /** 동적 SQL 파라미터 — sqlParam1/sqlParam2/sqlParam3/keyParam 형태로 API에 포함 */
  extraParams?: Record<string, string>;
  /** popup 진입 시 미리 채울 코드 검색어 (Enter fallback 시 사용) */
  initialCode?: string;
  /** popup 진입 시 미리 채울 코드명 검색어 */
  initialName?: string;
}) {
  const isMultiple = rowSelection === "multiple";
  const [rows, setRows] = useState<any[]>([]);
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState(initialName);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  useEffect(() => {
    handleSearch({
      ...(initialCode ? { code: initialCode } : {}),
      ...(initialName ? { name: initialName } : {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (extra: Record<string, any> = {}) => {
    // sqlId가 있으면 기존 commonApi 사용 — 세션은 commonApi 내부에서 URL 쿼리로 자동 부착
    if (sqlId) {
      commonApi
        .getCodesAndNames({
          key: "dsOut",
          sqlProp: sqlId,
          ...extraParams,
          ...extra,
        })
        .then((res: any) => {
          const datas = res.data.data.dsOut;
          let filterDatas;
          if (filterCol !== "") {
            filterDatas = datas.filter((x) => x[filterCol] === filterValue);
          } else {
            filterDatas = datas;
          }

          setRows(filterDatas ?? []);
        })
        .catch(console.error);
      return;
    }

    // fetchFn이 있으면 주입된 API 사용
    if (fetchFn) {
      fetchFn(extra)
        .then((res: any) => {
          // 응답 데이터를 { CODE, NAME } 형식으로 변환
          const result =
            res.data.data.dsOut ??
            res.data.result ??
            res.data.rows ??
            res.data.data ??
            [];
          setRows(result);
        })
        .catch(console.error);
      return;
    }
  };

  const onSearch = () => {
    handleSearch({
      ...(code && { code }),
      ...(name && { name }),
    });
  };

  // Enter 키로 조회 버튼과 동일 동작
  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch();
    }
  };

  const columnDefs = useMemo(
    () => [
      {
        headerName: "No",
        width: 60,
      },
      {
        headerName: "LBL_CODE",
        field: "CODE",
        width: 120,
        cellStyle: { textAlign: "center" },
      },
      {
        headerName: "LBL_CODE_NM",
        field: "NAME",
        flex: 1,
        minWidth: 300,
        disableMaxWidth: true,
      },
    ],
    [],
  );

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

        <div className="grid grid-cols-2 divide-x divide-y divide-slate-100">
          <div className="flex flex-col px-3 py-2 bg-white hover:bg-blue-50/40 transition-colors group">
            <label className="text-[10px] font-medium text-slate-400 mb-0.5 group-focus-within:text-blue-500 transition-colors">
              코드
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="CODE"
              className="text-[12px] text-slate-700 bg-transparent outline-none border-none placeholder:text-slate-300 w-full"
            />
          </div>
          <div className="flex flex-col px-3 py-2 bg-white hover:bg-blue-50/40 transition-colors group">
            <label className="text-[10px] font-medium text-slate-400 mb-0.5 group-focus-within:text-blue-500 transition-colors">
              코드명
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="NAME"
              className="text-[12px] text-slate-700 bg-transparent outline-none border-none placeholder:text-slate-300 w-full"
            />
          </div>
        </div>
      </div>

      {/* 선택 상태 표시 */}
      {selectedRows.length > 0 ? (
        isMultiple ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-700 min-w-0">
            <Check className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
            <span
              className="truncate min-w-0"
              title={selectedRows
                .map((r) => r.CODE + " | " + r.NAME)
                .join(", ")}
            >
              {selectedRows.map((r) => r.CODE + " | " + r.NAME).join(", ")}
            </span>
            <span className="ml-auto flex-shrink-0 text-[10px] text-blue-400 font-medium">
              {selectedRows.length}건 선택됨
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-700">
            <Check className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
            <span className="font-semibold">{selectedRows[0].CODE}</span>
            <span className="text-blue-300">|</span>
            <span>{selectedRows[0].NAME}</span>
            <span className="ml-auto text-[10px] text-blue-400 font-medium">
              선택됨
            </span>
          </div>
        )
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-[11px] text-slate-400">
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span>그리드에서 선택하세요</span>
        </div>
      )}

      {/* ================= Grid ================= */}
      <div className="shrink-0" style={{ height: 400 }}>
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={columnDefs}
          rowData={rows}
          pagination
          pageSize={20}
          rowSelection={rowSelection}
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
          onRowDoubleClicked={() => onApply(selectedRows)}
          disableAutoSize={true}
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
          onClick={() => onApply(isMultiple ? selectedRows : selectedRows[0])}
          className="h-7 px-4 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 gap-1.5"
        >
          <Check className="w-3 h-3" />
          적용
        </Button>
      </div>
    </div>
  );
}
