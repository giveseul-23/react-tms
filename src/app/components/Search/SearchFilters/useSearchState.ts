// src/app/components/Search/SearchFilters/useSearchState.ts
//
// 검색 조건 상태 관리:
//   - 초기 상태 빌드 (YMD/YMDT 기본값)
//   - 단일 필드 update
//   - reset (모듈 기본값 캐시도 재적용)

import { useState, useCallback, useEffect } from "react";
import type { SearchMeta } from "@/features/search/search.meta.types";
import { SearchCondition, popupNameKey } from "@/features/search/search.builder";
import { CONDITION_ICON_MAP } from "@/app/components/Search/conditionIcons";
import { getToday, getNowLocal, getTodayAt } from "./dateUtils";

type SearchDataType = "STRING" | "NUMBER" | "DATE";
type SearchState = Record<string, SearchCondition>;

export function useSearchState(
  meta: readonly SearchMeta[],
  moduleDefaultCacheRef: React.MutableRefObject<Record<string, string> | null>,
) {
  const [searchState, setSearchState] = useState<SearchState>({});

  /** 메타로부터 초기 검색 상태 생성 (YMD/YMDT만 기본값 채움) */
  const buildInitialSearchState = useCallback((): SearchState => {
    const today = getToday();
    const now = getNowLocal();
    const month = today.slice(0, 7); // YYYY-MM (YM 기본값)
    const year = today.slice(0, 4); // YYYY (Y 기본값)
    const initial: SearchState = {};

    meta.forEach((m) => {
      if (
        m.type !== "YMD" &&
        m.type !== "YMDT" &&
        m.type !== "YM" &&
        m.type !== "Y"
      )
        return;

      if (m.mode === "N") {
        // 단일: Y=올해 / YM=이번달 / YMD=오늘 / YMDT=지금(초까지)
        initial[m.key] = {
          key: m.key,
          operator: m.condition ?? "equal",
          dataType: m.dataType,
          value:
            m.type === "YMDT"
              ? now
              : m.type === "YM"
                ? month
                : m.type === "Y"
                  ? year
                  : today,
        };
      } else {
        // 범위: Y=올해~올해 / YM=이번달~이번달 / YMD=오늘~오늘 / YMDT=00:00:00~23:59:59
        const fromKey = `${m.key}_FRM`;
        const toKey = `${m.key}_TO`;
        const fromVal =
          m.type === "YMDT"
            ? getTodayAt("00:00:00")
            : m.type === "YM"
              ? month
              : m.type === "Y"
                ? year
                : today;
        const toVal =
          m.type === "YMDT"
            ? getTodayAt("23:59:59")
            : m.type === "YM"
              ? month
              : m.type === "Y"
                ? year
                : today;

        initial[fromKey] = {
          key: fromKey,
          operator: m.condition ?? "equal",
          dataType: m.dataType,
          value: fromVal,
        };
        initial[toKey] = {
          key: toKey,
          operator: m.condition ?? "equal",
          dataType: m.dataType,
          value: toVal,
        };
      }
    });

    return initial;
  }, [meta]);

  // 메타가 로드되면 초기 상태 설정
  useEffect(() => {
    if (!meta?.length) return;
    setSearchState(buildInitialSearchState());
  }, [meta, buildInitialSearchState]);

  const getCondition = (key: string): SearchCondition | undefined =>
    searchState[key];

  const updateCondition = (
    key: string,
    newValue: string,
    operator: keyof typeof CONDITION_ICON_MAP,
    dataType: SearchDataType,
    sourceType: "POPUP" | "NORMAL" = "NORMAL",
  ) => {
    setSearchState((prev) => ({
      ...prev,
      [key]: {
        key,
        operator,
        dataType,
        value: newValue ?? "",
        sourceType,
      },
    }));
  };

  // state 키 → 대응 meta 찾기 (POPUP 의 _CD/코드명 쌍 포함).
  // 코드명 키는 충돌 시 `${base}__NM` 으로 분리되므로 popupNameKey 로 매칭.
  const findMetaForStateKey = (k: string): SearchMeta | undefined => {
    const popupByName = meta.find(
      (m) => m.type === "POPUP" && popupNameKey(m.key, meta) === k,
    );
    if (popupByName) return popupByName;
    if (k.endsWith("_CD")) {
      const baseKey = k.replace(/_CD$/, "");
      const popup = meta.find(
        (m) => m.type === "POPUP" && m.key.replace("_CD", "") === baseKey,
      );
      if (popup) return popup;
    }
    return meta.find((m) => m.key === k);
  };

  /** 초기화 — 기본값 + 모듈 기본값 캐시 재적용 */
  const handleReset = () => {
    const initial = buildInitialSearchState();

    if (moduleDefaultCacheRef.current) {
      for (const [k, v] of Object.entries(moduleDefaultCacheRef.current)) {
        if (initial[k]) {
          initial[k] = { ...initial[k], value: v };
        } else {
          const m = findMetaForStateKey(k);
          initial[k] = {
            key: k,
            operator: "equal",
            dataType: m?.dataType ?? "STRING",
            value: v,
            sourceType: k.endsWith("_NM") ? "POPUP" : "NORMAL",
          };
        }
      }
    }

    setSearchState(initial);
  };

  return {
    searchState,
    setSearchState,
    getCondition,
    updateCondition,
    handleReset,
    buildInitialSearchState,
  };
}
