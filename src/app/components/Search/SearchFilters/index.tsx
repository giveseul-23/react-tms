// src/app/components/Search/SearchFilters/index.tsx
//
// 검색 조건 영역 메인 컴포넌트.
// 상태/실행/모듈 기본값/렌더는 각각 훅과 컴포넌트로 분리.

"use client";

import React, { useState, useRef, ReactNode } from "react";
import {
  Search,
  RefreshCw,
  ChevronDown,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";

import type { SearchMeta } from "@/features/search/search.meta.types";
import { type TreeGridHandle } from "@/app/components/grid/TreeGrid";

import { useSearchState } from "./useSearchState";
import { useModuleDefault } from "./useModuleDefault";
import {
  useSearchExecute,
  type SearchResult,
  type ParamMode,
} from "./useSearchExecute";
import { SearchFieldRenderer } from "./SearchFieldRenderer";

export type { SearchResult, ParamMode };

interface SearchFiltersProps {
  meta: readonly SearchMeta[];
  onSearch: (data: SearchResult) => void;
  treeGridRef?: React.MutableRefObject<TreeGridHandle>;
  searchRef?: React.MutableRefObject<((page?: number) => void) | null>;
  filtersRef?: React.MutableRefObject<Record<string, unknown>>;
  rawFiltersRef?: React.MutableRefObject<Record<string, string>>;
  pageSize?: number;
  /** fetchFn을 prop으로 주입받아 도메인 API 직접 의존 제거 */
  fetchFn: (params: Record<string, unknown>) => Promise<any>;
  /** DataGrid 두 개인 화면에서만 전달 — 초기화 버튼 옆에 렌더링 */
  layoutToggle?: ReactNode;
  excludeKeysRef?: React.MutableRefObject<Set<string>>;
  computeTotalCount?: (rows: any[]) => number;
  /** 모듈 기본값 조회 — 모듈명 (예: "TMS"). falsy면 비활성 */
  moduleDefault?: string;
  moduleDefaultParams?: Record<string, unknown>;
  moduleDefaultRemove?: string[];
  /** 모듈 기본값 API 호출 시 다른 검색조건 값을 파라미터로 전달
   *  예: { DIV_CD: "DIV_CD" } → DIV_CD 필드의 현재 값을 API param DIV_CD로 전달 */
  moduleDefaultSearchParams?: Record<string, string>;
  /** "RAW" 일 때 DYNAMIC_QUERY 대신 SRCH_* 접두 rawFilters를 그대로 fetchFn에 전달 */
  paramMode?: ParamMode;
}

export function SearchFilters({
  meta,
  onSearch,
  searchRef,
  filtersRef,
  rawFiltersRef,
  pageSize = 20,
  fetchFn,
  layoutToggle,
  excludeKeysRef,
  computeTotalCount,
  moduleDefault,
  moduleDefaultParams,
  moduleDefaultRemove,
  moduleDefaultSearchParams,
  paramMode,
}: SearchFiltersProps) {
  const [open, setOpen] = useState(true);

  // 모듈 기본값 캐시 — useModuleDefault가 write, useSearchState가 reset 시 read
  const moduleDefaultCacheRef = useRef<Record<string, string> | null>(null);

  // 1) 검색 상태
  const {
    searchState,
    setSearchState,
    getCondition,
    updateCondition,
    handleReset,
    buildInitialSearchState,
  } = useSearchState(meta, moduleDefaultCacheRef);

  // 2) 모듈 기본값 자동 로드
  useModuleDefault({
    meta,
    moduleDefault,
    moduleDefaultParams,
    moduleDefaultRemove,
    moduleDefaultSearchParams,
    buildInitialSearchState,
    setSearchState,
    moduleDefaultCacheRef,
  });

  // 3) 조회 실행
  const { searching, handleSearch } = useSearchExecute({
    meta,
    searchState,
    fetchFn,
    onSearch,
    pageSize,
    filtersRef,
    rawFiltersRef,
    excludeKeysRef,
    computeTotalCount,
    searchRef,
    paramMode,
  });

  return (
    <Card className="shadow-sm rounded-lg">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div
          className={`flex items-center justify-between px-3 py-1.5 bg-[rgb(var(--primary))] ${open ? "rounded-t-lg" : "rounded-lg"}`}
        >
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-white mt-px" />
            <span className="text-[13px] font-semibold text-white uppercase leading-none">
              조회조건
            </span>
          </div>

          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-slate-200 hover:bg-transparent hover:text-white hover:font-bold"
            >
              {open ? "접기" : "펼치기"}
              <ChevronDown
                className={`w-4 h-4 ml-1 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <CardContent
            className="
            p-2
            text-[12px]

            [&_input]:h-6
            [&_input]:px-2
            [&_input]:py-0
            [&_input]:text-[11px]

            [&_select]:h-6
            [&_[role=combobox]]:h-6
            [&_button]:h-6
            "
          >
            <div className="grid grid-cols-20 gap-x-2 gap-y-1">
              <SearchFieldRenderer
                meta={meta}
                getCondition={getCondition}
                updateCondition={updateCondition}
              />
            </div>
          </CardContent>

          <div className="flex justify-between px-2 py-1 border-t">
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="xs" onClick={handleReset}>
                <RefreshCw className="w-3 h-3" />
                초기화
              </Button>
              {layoutToggle}
            </div>

            <Button
              variant="outline"
              size="xs"
              onClick={() => handleSearch(1)}
              disabled={searching}
              className="btn-primary btn-primary:hover"
            >
              {searching ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Search className="w-3 h-3" />
              )}
              {searching ? "조회중..." : "조회"}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
