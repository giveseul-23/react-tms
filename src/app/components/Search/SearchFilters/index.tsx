// src/app/components/Search/SearchFilters/index.tsx
//
// 검색 조건 영역 메인 컴포넌트.
// 상태/실행/모듈 기본값/렌더는 각각 훅과 컴포넌트로 분리.

"use client";

import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  ReactNode,
} from "react";
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
import {
  useSearchCondition,
  type ExcludeSpec,
} from "@/hooks/useSearchCondition";
import { Lang } from "@/app/services/common/Lang";
import { computeDisabled, type FieldRules } from "./fieldRules";

export type { SearchResult, ParamMode };
export type { FieldRule, FieldRules, EnableCondition } from "./fieldRules";

interface SearchFiltersProps {
  meta: readonly SearchMeta[];
  onSearchCallback: (data: SearchResult) => void;
  treeGridRef?: React.MutableRefObject<TreeGridHandle>;
  searchRef?: React.MutableRefObject<((page?: number) => void) | null>;
  filtersRef?: React.MutableRefObject<Record<string, unknown>>;
  rawFiltersRef?: React.MutableRefObject<Record<string, string>>;
  pageSize?: number;
  /** fetchFn을 prop으로 주입받아 도메인 API 직접 의존 제거 */
  fetchFn: (params: Record<string, unknown>) => Promise<any>;
  /** DataGrid 두 개인 화면에서만 전달 — 초기화 버튼 옆에 렌더링 */
  layoutToggle?: ReactNode;
  /** 검색 payload 에서 제외할 키 선언. 문자열 또는 {column, as, transform} 형태.
   *  지정 시 SearchFilters 가 내부에서 useSearchCondition 호출 + fetchFn 자동 wrap.
   *  Controller 에서 transformParams 직접 호출 불필요. */
  excludes?: readonly ExcludeSpec[];
  computeTotalCount?: (rows: any) => number;
  /** 모듈 기본값 조회 — 모듈명 (예: "TMS"). falsy면 비활성 */
  moduleDefault?: string;
  moduleDefaultParams?: Record<string, unknown>;
  moduleDefaultRemove?: string[];
  /** 모듈 기본값 API 호출 시 다른 검색조건 값을 파라미터로 전달
   *  예: { DIV_CD: "DIV_CD" } → DIV_CD 필드의 현재 값을 API param DIV_CD로 전달 */
  moduleDefaultSearchParams?: Record<string, string>;
  /** "RAW" 일 때 DYNAMIC_QUERY 대신 SRCH_* 접두 rawFilters를 그대로 fetchFn에 전달 */
  paramMode?: ParamMode;
  /** 메뉴 코드 — DYNAMIC_QUERY / DS_SEARCH_CONDITION 모드 payload 의 MENU_CD */
  menuCode?: string;
  /** [TEMP-userTz] DATE 필터 tz 보정 — 서버 완료 시 제거 */
  userTz?: string;
  /** 다른 필드 값에 따라 특정 필드를 활성/비활성(+필수/자동클리어)하는 선언 규칙.
   *  Record<대상필드 key, FieldRule>. 화면 포크 없이 prop 으로만 선언한다. */
  fieldRules?: FieldRules;
}

export function SearchFilters({
  meta,
  onSearchCallback,
  searchRef,
  filtersRef,
  rawFiltersRef,
  pageSize = 20,
  fetchFn,
  layoutToggle,
  excludes,
  computeTotalCount,
  moduleDefault,
  moduleDefaultParams,
  moduleDefaultRemove,
  moduleDefaultSearchParams,
  paramMode,
  menuCode,
  fieldRules,
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

  // 1-b) enableWhen 규칙 — 비활성 대상/state 키 계산 (현재 조건값 기준)
  //   disabledStateKeys: 입력 차단(비활성이면 무조건) / clearStateKeys: 자동 클리어·쿼리 제외(clearOnDisable !== false)
  const { disabledTargets, disabledStateKeys, clearStateKeys } = useMemo(
    () => computeDisabled(meta, fieldRules, getCondition),
    // getCondition 은 searchState 를 클로저로 읽으므로 searchState 를 dep 에 포함
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [meta, fieldRules, searchState],
  );

  // 비활성 필드로의 값 입력 차단 (클리어는 허용). 활성 필드는 그대로 통과.
  const guardedUpdateCondition = useMemo(
    () =>
      (
        key: string,
        value: string,
        operator: Parameters<typeof updateCondition>[2],
        dataType: Parameters<typeof updateCondition>[3],
        sourceType: "POPUP" | "NORMAL" = "NORMAL",
      ) => {
        if (disabledStateKeys.has(key) && String(value ?? "").trim() !== "")
          return;
        updateCondition(key, value, operator, dataType, sourceType);
      },
    [disabledStateKeys, updateCondition],
  );

  // 비활성 전환 시 대상 필드 값 자동 클리어 (clearOnDisable !== false 인 대상만).
  //   clearOnDisable:false 필드는 비활성돼도 값 보존.
  const clearKeysSig = useMemo(
    () => [...clearStateKeys].sort().join(","),
    [clearStateKeys],
  );
  useEffect(() => {
    if (!clearStateKeys.size) return;
    for (const key of clearStateKeys) {
      const cur = searchState[key];
      if (!cur?.value) continue;
      updateCondition(
        key,
        "",
        (cur.operator ?? "equal") as Parameters<typeof updateCondition>[2],
        cur.dataType ?? "STRING",
        cur.sourceType ?? (key.endsWith("_NM") ? "POPUP" : "NORMAL"),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearKeysSig, searchState]);

  // required 오버라이드: 활성+requiredWhenEnabled → 필수 / 비활성 → 필수 해제.
  // (SearchFieldRenderer 표시 + useSearchExecute 필수검증 공용)
  const effectiveMeta = useMemo(() => {
    if (!fieldRules) return meta;
    return meta.map((m) => {
      const rule = fieldRules[m.key];
      if (!rule) return m;
      const enabled = !disabledTargets.has(m.key);
      const required = enabled
        ? rule.requiredWhenEnabled
          ? true
          : m.required
        : false;
      return required === m.required ? m : { ...m, required };
    });
  }, [meta, fieldRules, disabledTargets]);

  // 클리어 대상 값은 쿼리에서 제외 (클리어 effect 와 이중 안전장치).
  //   clearOnDisable:false 로 값 보존한 필드는 그대로 쿼리에 포함.
  const searchStateForQuery = useMemo(() => {
    if (!clearStateKeys.size) return searchState;
    const stripped = { ...searchState };
    for (const key of clearStateKeys) {
      const cur = stripped[key];
      if (cur?.value) stripped[key] = { ...cur, value: "" };
    }
    return stripped;
  }, [searchState, clearKeysSig]);

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
    searchState,
  });

  // 3) 제외 키 / 키 리네임 — excludes 선언 시 자동 처리
  const searchCondition = useSearchCondition({
    meta,
    filtersRef,
    excludes,
  });

  const wrappedFetchFn = useMemo(
    () =>
      excludes && excludes.length > 0
        ? (params: Record<string, unknown>) =>
            fetchFn(searchCondition.transformParams(params))
        : fetchFn,
    [excludes, fetchFn, searchCondition],
  );

  // 4) 조회 실행
  const { searching, handleSearch } = useSearchExecute({
    meta: effectiveMeta,
    searchState: searchStateForQuery,
    fetchFn: wrappedFetchFn,
    onSearchCallback,
    pageSize,
    filtersRef,
    rawFiltersRef,
    excludeKeysRef: searchCondition.excludeKeysRef,
    computeTotalCount,
    searchRef,
    menuCode,
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

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="xs"
              onClick={handleReset}
              className="h-6 px-2 bg-white/15 hover:bg-white border border-white/30 text-white hover:text-[rgb(var(--primary))] text-[11px] font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
            {layoutToggle}
            <Button
              variant="ghost"
              size="xs"
              onClick={() => handleSearch(1)}
              disabled={searching}
              className="h-6 px-2 bg-white/15 hover:bg-white border border-white/30 text-white hover:text-[rgb(var(--primary))] text-[11px] font-semibold"
            >
              {searching ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Search className="w-3 h-3" />
              )}
              {searching ? Lang.get("LBL_SEARCHING") : Lang.get("LBL_SEARCH")}
            </Button>

            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="xs"
                className="h-6 px-2 bg-white/15 hover:bg-white border border-white/30 text-white hover:text-[rgb(var(--primary))] text-[11px] font-semibold"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <CardContent
            onKeyDownCapture={(e) => {
              if (e.key !== "Enter" || e.nativeEvent.isComposing || searching)
                return;
              // 팝업 필드 Enter 는 조회로 가로채지 않고 필드 자체 처리(코드해석→자동적용/팝업)에 맡긴다.
              if ((e.target as HTMLElement)?.closest?.("[data-popup-field]"))
                return;
              e.preventDefault();
              e.stopPropagation(); // 그 외 필드의 Enter 는 자체 동작(콤보 열기 등) 억제하고 조회만 실행
              handleSearch(1);
            }}
            className="
            p-2
            [&:last-child]:pb-2
            text-[12px]

            [&_input]:h-6
            [&_input]:px-2
            [&_input]:py-0
            [&_input]:text-[11px]
            [&_input]:selection:text-gray-700
            [&_input]:selection:bg-gray-300

            [&_select]:h-6
            [&_[role=combobox]]:h-6
            [&_button]:h-6
            "
          >
            <div className="grid grid-cols-20 gap-x-2 gap-y-1">
              <SearchFieldRenderer
                meta={effectiveMeta}
                getCondition={getCondition}
                updateCondition={
                  fieldRules ? guardedUpdateCondition : updateCondition
                }
                disabledKeys={fieldRules ? disabledTargets : undefined}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
