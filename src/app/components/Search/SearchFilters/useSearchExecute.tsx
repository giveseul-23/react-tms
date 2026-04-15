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

      const params: Record<string, unknown> = {
        DYNAMIC_QUERY: whereClause,
        MENU_CD: "test",
        page: targetPage,
        limit: limitRef.current,
        ...extraParams,
      };

      if (filtersRef) {
        filtersRef.current = {
          DYNAMIC_QUERY: whereClause,
          MENU_CD: "test",
          ...extraParams,
        };
      }

      // ── rawFiltersRef: 개별 key-value 원본 ──────────────────
      // 네이밍: DSPCH.DIV_CD → SRCH_DSPCH_DIV_CD (dot → _, SRCH_ 접두)
      if (rawFiltersRef) {
        // 날짜 키 집합 (YMD/YMDT의 _FRM/_TO 및 단일키)
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

        const raw: Record<string, string> = {};
        Object.values(searchState).forEach((v) => {
          if (v.value != null && v.value !== "" && v.value !== "ALL") {
            const key = `SRCH_${v.key.replace(/\./g, "_")}`;
            // 날짜 파라미터는 '-' 제거
            raw[key] = dateKeys.has(v.key)
              ? String(v.value).replace(/-/g, "")
              : String(v.value);
          }
        });
        rawFiltersRef.current = raw;
      }

      // ── 실제 fetch ─────────────────────────────────────────
      setSearching(true);
      fetchFn(params)
        .then((res: any) => {
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
            String(err?.response?.data?.error ?? err?.message ?? err);

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
