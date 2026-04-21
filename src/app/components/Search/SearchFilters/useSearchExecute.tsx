// src/app/components/Search/SearchFilters/useSearchExecute.tsx
//
// 검색 실행:
//   - 필수 항목 누락 체크
//   - DYNAMIC_QUERY 빌드
//   - rawFiltersRef 빌드 (날짜는 '-' 제거)
//   - fetchFn 호출 → onSearch 콜백
//   - pageSize 변경 시 자동 재조회
//   - searchRef에 핸들러 노출

import React, { useState, useCallback, useEffect, useRef } from "react";
import type { SearchMeta } from "@/features/search/search.meta.types";
import {
  buildSearchCondition,
  SearchCondition,
} from "@/features/search/search.builder";
import { usePopup } from "@/app/components/popup/PopupContext";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";
import { showSearchToast } from "@/app/components/ui/SearchToast";

type SearchState = Record<string, SearchCondition>;

export type SearchResult = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

export type ParamMode = "DYNAMIC_QUERY" | "RAW";

interface UseSearchExecuteParams {
  meta: readonly SearchMeta[];
  searchState: SearchState;
  fetchFn: (params: Record<string, unknown>) => Promise<any>;
  onSearch: (data: SearchResult) => void;
  pageSize: number;
  filtersRef?: React.MutableRefObject<Record<string, unknown>>;
  rawFiltersRef?: React.MutableRefObject<Record<string, string>>;
  excludeKeysRef?: React.MutableRefObject<Set<string>>;
  computeTotalCount?: (rows: any[]) => number;
  searchRef?: React.MutableRefObject<((page?: number) => void) | null>;
  /** "DYNAMIC_QUERY"(기본): { DYNAMIC_QUERY, MENU_CD, page, limit, ...extraParams }
   *  "RAW": { ...rawFilters(SRCH_* 맵), page, limit, ...extraParams } */
  paramMode?: ParamMode;
}

export function useSearchExecute({
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
  paramMode = "DYNAMIC_QUERY",
}: UseSearchExecuteParams) {
  const { openPopup, closePopup } = usePopup();
  const [searching, setSearching] = useState(false);
  const limitRef = useRef(pageSize);

  useEffect(() => {
    limitRef.current = pageSize;
  }, [pageSize]);

  const handleSearch = useCallback(
    (targetPage = 1, showToast = true) => {
      // ── 필수 항목 누락 체크 ─────────────────────────────────
      const missingFields = meta
        .filter((m) => m.required === true)
        .filter((m) => {
          if (m.type === "YMD" || m.type === "YMDT") {
            if (m.mode === "N") {
              return !searchState[m.key]?.value;
            }
            return (
              !searchState[`${m.key}_FRM`]?.value ||
              !searchState[`${m.key}_TO`]?.value
            );
          }
          if (m.type === "POPUP") {
            // SearchFieldRenderer와 동일 규칙: baseKey = m.key.replace("_CD","")
            const baseKey = m.key.replace("_CD", "");
            return (
              !searchState[`${baseKey}_CD`]?.value ||
              !searchState[`${baseKey}_NM`]?.value
            );
          }
          return !searchState[m.key]?.value;
        });

      if (missingFields.length > 0) {
        const labels = missingFields.map((m) => m.label).join(", ");
        openPopup({
          title: "",
          content: (
            <ConfirmModal
              type="error"
              title="필수 항목 누락"
              description={`다음 항목을 입력해주세요 : ${labels}`}
              onClose={closePopup}
            />
          ),
          width: "sm",
        });
        return;
      }

      // ── DYNAMIC_QUERY 빌드 ──────────────────────────────────
      const conditions: string[] = [];
      const extraParams: Record<string, any> = {};

      Object.values(searchState).forEach((v) => {
        if (excludeKeysRef?.current.has(v.key)) {
          extraParams[v.key] = v.value;
          return;
        }
        if (v.value === "ALL") return;
        conditions.push(buildSearchCondition(v));
      });

      // DYNAMIC_QUERY는 항상 "1=1"로 시작 (buildSearchCondition은 " AND ..."를 반환)
      const filteredConditions = conditions.filter(Boolean);
      const whereClause = "1=1" + filteredConditions.join("");

      // ── rawFilters(SRCH_* 접두 맵) 빌드 ─────────────────────
      // 네이밍: DSPCH.DIV_CD → SRCH_DSPCH_DIV_CD (dot → _, SRCH_ 접두)
      const dateKeys = new Set<string>();
      meta.forEach((m) => {
        if (m.type === "YMD" || m.type === "YMDT") {
          if (m.mode === "N") {
            dateKeys.add(m.key);
          } else {
            dateKeys.add(`${m.key}_FRM`);
            dateKeys.add(`${m.key}_TO`);
          }
        }
      });

      const rawFilters: Record<string, string> = {};
      Object.values(searchState).forEach((v) => {
        if (v.value != null && v.value !== "" && v.value !== "ALL") {
          const key = `SRCH_${v.key.replace(/\./g, "_")}`;
          // 날짜 파라미터는 '-' 제거
          rawFilters[key] = dateKeys.has(v.key)
            ? String(v.value).replace(/-/g, "")
            : String(v.value);
        }
      });

      if (rawFiltersRef) rawFiltersRef.current = rawFilters;

      // ── fetchFn에 전달할 params 조립 ────────────────────────
      const params: Record<string, unknown> =
        paramMode === "RAW"
          ? {
              ...rawFilters,
              page: targetPage,
              limit: limitRef.current,
              ...extraParams,
            }
          : {
              DYNAMIC_QUERY: whereClause,
              MENU_CD: "test",
              page: targetPage,
              limit: limitRef.current,
              ...extraParams,
            };

      if (filtersRef) {
        const {
          page: _p,
          limit: _l,
          ...rest
        } = params as Record<string, unknown>;
        filtersRef.current = rest;
      }

      // ── 실제 fetch ─────────────────────────────────────────
      const showErrorPopup = (message: string) => {
        openPopup({
          title: "",
          content: (
            <ConfirmModal
              type="error"
              title="조회 오류"
              description={message}
              onClose={closePopup}
            />
          ),
          width: "sm",
        });
      };

      setSearching(true);
      fetchFn(params)
        .then((res: any) => {
          // 서버가 200을 주면서 success:false로 실패를 알리는 경우
          if (res?.data?.success === false) {
            showErrorPopup(res.data.msg ?? "조회 중 오류가 발생했습니다.");
            return;
          }

          const rows =
            res.data.result ??
            res.data.data.allData?.data ??
            res.data.data.dsOut ??
            res.data.data ??
            [];

          const totalCount = computeTotalCount
            ? computeTotalCount(rows)
            : rows[0]?.TOTALCOUNT != null
              ? Number(rows[0].TOTALCOUNT)
              : rows.length;

          onSearch({
            rows,
            totalCount,
            page: targetPage,
            limit: limitRef.current,
          });
          if (showToast) showSearchToast(totalCount);
        })
        .catch((err: any) => {
          const message =
            err?.response?.data?.error?.message ??
            err?.response?.data?.msg ??
            String(err?.response?.data?.error ?? err?.message ?? err);

          showErrorPopup(message);
        })
        .finally(() => setSearching(false));
    },
    [
      meta,
      searchState,
      fetchFn,
      onSearch,
      filtersRef,
      rawFiltersRef,
      excludeKeysRef,
      computeTotalCount,
      paramMode,
      openPopup,
      closePopup,
    ],
  );

  // pageSize 변경 시 자동 재조회 (초기 마운트 제외)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    handleSearch(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  // searchRef에 핸들러 노출
  useEffect(() => {
    if (searchRef) searchRef.current = handleSearch;
  }, [searchRef, handleSearch]);

  return { searching, handleSearch };
}
