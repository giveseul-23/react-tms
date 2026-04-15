// src/app/components/Search/SearchFilters/useModuleDefault.ts
//
// 메타가 로드되면 모듈 기본값(센차 setModuleDefaultValue 대응)을 자동 조회하여
// searchState에 머지. 결과는 reset 시 재적용을 위해 외부 ref에 캐시.

import { useEffect, useRef } from "react";
import type { SearchMeta } from "@/features/search/search.meta.types";
import { SearchCondition } from "@/features/search/search.builder";
import { commonApi } from "@/app/services/common/commonApi";

type SearchState = Record<string, SearchCondition>;

interface UseModuleDefaultParams {
  meta: readonly SearchMeta[];
  moduleDefault?: string;
  moduleDefaultParams?: Record<string, unknown>;
  moduleDefaultRemove?: string[];
  /** 다른 검색필드 값을 API param으로 전달 — 예: { DIV_CD: "DIV_CD" } */
  moduleDefaultSearchParams?: Record<string, string>;
  buildInitialSearchState: () => SearchState;
  setSearchState: React.Dispatch<React.SetStateAction<SearchState>>;
  /** 캐시 ref — reset 시 useSearchState가 read */
  moduleDefaultCacheRef: React.MutableRefObject<Record<string, string> | null>;
}

export function useModuleDefault({
  meta,
  moduleDefault,
  moduleDefaultParams,
  moduleDefaultRemove,
  moduleDefaultSearchParams,
  buildInitialSearchState,
  setSearchState,
  moduleDefaultCacheRef,
}: UseModuleDefaultParams) {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!meta?.length) return;
    if (!moduleDefault || loadedRef.current) return;
    loadedRef.current = true;

    const initialState = buildInitialSearchState();
    const apiParams: Record<string, unknown> = { ...moduleDefaultParams };

    // searchParams: 다른 검색필드의 현재 값을 API 파라미터로 전달
    if (moduleDefaultSearchParams) {
      for (const [paramKey, fieldKey] of Object.entries(
        moduleDefaultSearchParams,
      )) {
        apiParams[paramKey] = initialState[fieldKey]?.value ?? "";
      }
    }

    commonApi
      .fetchModuleDefaultValue(moduleDefault, apiParams)
      .then((res: any) => {
        const data = res.data?.data?.dsOut?.[0];
        if (!data) return;

        const removeSet = new Set(moduleDefaultRemove ?? []);
        const defaults: Record<string, string> = {};

        // API 응답 key(예: LGST_GRP_CD)로 meta 찾기
        // meta key가 DTL.LGST_GRP_CD 처럼 prefix가 붙어있을 수 있으므로
        // 정확 일치 → '.<key>'로 끝나는 것 순으로 탐색
        const findMeta = (apiKey: string) =>
          meta.find((m) => m.key === apiKey || m.key.endsWith("." + apiKey));

        for (const [key, rawValue] of Object.entries(data)) {
          if (removeSet.has(key)) continue;
          const parts = String(rawValue).split("^SPLT^");
          const code = parts[0] ?? "";
          const name = parts[1] ?? "";

          const m = findMeta(key);
          if (!m) continue;
          const metaKey = m.key;

          if (m.type === "POPUP") {
            // POPUP: _CD = code, _NM = name
            const baseKey = metaKey.replace("_CD", "");
            defaults[`${baseKey}_CD`] = code;
            if (name) defaults[`${baseKey}_NM`] = name;
          } else {
            // COMBO / TEXT 등: code만 세팅
            defaults[metaKey] = code;
          }
        }

        // 캐시 저장 (reset 시 재적용용)
        moduleDefaultCacheRef.current = defaults;

        setSearchState((prev) => {
          const next = { ...prev };
          for (const [k, v] of Object.entries(defaults)) {
            if (next[k]) {
              next[k] = { ...next[k], value: v };
            } else {
              // 사용자 입력이 없어 searchState에 없는 필드(COMBO/TEXT/POPUP _NM 등)에 기본값 세팅
              next[k] = {
                key: k,
                operator: "equal",
                dataType: "STRING",
                value: v,
                sourceType: k.endsWith("_NM") ? "POPUP" : "NORMAL",
              };
            }
          }
          return next;
        });
      })
      .catch((err: any) =>
        console.error("[SearchFilters] fetchModuleDefaultValue failed", err),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta]);
}
