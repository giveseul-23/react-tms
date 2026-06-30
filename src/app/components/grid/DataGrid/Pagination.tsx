"use client";
// app/components/grid/Pagination.tsx
// DataGrid 하단 페이지네이션 바. totalCount/pageSize/currentPage 를 외부에서
// 받아 페이지 이동/페이지당 행 수 변경을 onPageChange/onPageSizeChange 로 통지.

import { useCallback, useEffect, useState } from "react";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type PaginationProps = {
  totalCount: number;
  currentPage?: number;
  pageSize: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
};

const BTN_CLS =
  "px-1.5 py-0.5 border border-gray-300 rounded text-[11px] disabled:opacity-40 hover:bg-gray-100 leading-none";

export function Pagination({
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const [pageSizeInput, setPageSizeInput] = useState<string>(String(pageSize));
  const [pageInput, setPageInput] = useState<string>(String(currentPage ?? 1));

  useEffect(() => {
    setPageInput(String(currentPage ?? 1));
  }, [currentPage]);

  useEffect(() => {
    setPageSizeInput(String(pageSize));
  }, [pageSize]);

  const totalPages = Math.ceil(totalCount / (pageSize ?? 20));
  const isEmpty = totalCount === 0;
  const isFirst = isEmpty || currentPage === 1;
  const isLast = isEmpty || currentPage === totalPages;

  const commitPageSize = useCallback(() => {
    const v = parseInt(pageSizeInput);
    if (!isNaN(v) && v > 0) {
      onPageSizeChange?.(v);
    } else {
      setPageSizeInput(String(pageSize));
    }
  }, [pageSizeInput, pageSize, onPageSizeChange]);

  const commitPage = useCallback(
    (raw?: string) => {
      const v = parseInt(raw ?? pageInput);
      if (!isNaN(v) && v >= 1 && v <= (totalPages || 1)) {
        onPageChange?.(v);
      } else {
        setPageInput(String(currentPage ?? 1));
      }
    },
    [pageInput, totalPages, currentPage, onPageChange],
  );

  return (
    <div className="flex items-center gap-2 px-2 py-1 shrink-0 text-[11px] text-gray-600">
      <span className="inline-flex items-center justify-center min-w-[28px] h-5 px-1.5 rounded border border-gray-300 bg-gray-100 font-medium text-gray-700">
        {totalCount.toLocaleString()}
      </span>

      <span className="shrink-0 text-gray-500">페이지당 행 개수:</span>
      <input
        type="number"
        min={1}
        value={pageSizeInput}
        onChange={(e) => setPageSizeInput(e.target.value)}
        onBlur={commitPageSize}
        onKeyDown={(e) => e.key === "Enter" && commitPageSize()}
        className="w-14 h-5 px-1 border border-gray-300 rounded text-center text-[11px] bg-[rgb(var(--bg))]"
      />

      <span className="shrink-0 text-gray-500">현재 페이지:</span>
      <input
        type="number"
        min={1}
        max={totalPages || 1}
        value={pageInput}
        onChange={(e) => {
          setPageInput(e.target.value);
          commitPage(e.target.value);
        }}
        className="w-14 h-5 px-1 border border-gray-300 rounded text-center text-[11px] bg-[rgb(var(--bg))]"
      />
      <span className="shrink-0 text-gray-500">
        / {isEmpty ? 0 : totalPages} 페이지
      </span>

      <div className="ml-auto flex items-center gap-0.5">
        <button
          disabled={isFirst}
          onClick={() => onPageChange?.(1)}
          className={BTN_CLS}
        >
          <ChevronFirst className="w-3 h-3" />
        </button>
        <button
          disabled={isFirst}
          onClick={() => onPageChange?.((currentPage ?? 1) - 1)}
          className={BTN_CLS}
        >
          <ChevronLeft className="w-3 h-3" />
        </button>
        <button
          disabled={isLast}
          onClick={() => onPageChange?.((currentPage ?? 1) + 1)}
          className={BTN_CLS}
        >
          <ChevronRight className="w-3 h-3" />
        </button>
        <button
          disabled={isLast}
          onClick={() => onPageChange?.(totalPages)}
          className={BTN_CLS}
        >
          <ChevronLast className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
