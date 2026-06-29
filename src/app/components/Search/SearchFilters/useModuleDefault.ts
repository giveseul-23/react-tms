// src/app/components/Search/SearchFilters/useModuleDefault.ts
//
// 메타가 로드되면 모듈 기본값(센차 setModuleDefaultValue 대응)을 자동 조회하여
// searchState에 머지. 결과는 reset 시 재적용을 위해 외부 ref에 캐시.

import { useEffect, useMemo, useRef } from "react";
import type { SearchMeta } from "@/features/search/search.meta.types";
import { SearchCondition, popupNameKey } from "@/features/search/search.builder";
import { commonApi } from "@/app/services/common/commonApi";

// 어떤 접두사가 붙어도(경계 _ . 또는 시작) 해당 키로 끝나는 meta 를 매칭.
//  예: LGST_GRP_CD → LGST_GRP_CD / DTL.LGST_GRP_CD / SRCH_DSPCH_LGST_GRP_CD
const keyEndsWith = (metaKey: string, apiKey: string) =>
  new RegExp(`(^|[._])${apiKey}$`).test(metaKey);

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
  /** 현재 검색 상태 — DIV 변경 감지용 */
  searchState: SearchState;
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
  searchState,
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
          meta.find((m) => keyEndsWith(m.key, apiKey)) ??
          meta.find((m) => keyEndsWith(m.key, "PAY_" + apiKey));

        for (const [key, rawValue] of Object.entries(data)) {
          if (removeSet.has(key)) continue;
          const parts = String(rawValue).split("^SPLT^");
          const code = parts[0] ?? "";
          const name = parts[1] ?? "";

          const m = findMeta(key);
          if (!m) continue;
          const metaKey = m.key;

          if (m.type === "POPUP") {
            // POPUP: _CD = code, 코드명 = popupNameKey(충돌 시 <base>__NM)
            const baseKey = metaKey.replace("_CD", "");
            defaults[`${baseKey}_CD`] = code;
            if (name) defaults[popupNameKey(metaKey, meta)] = name;
          } else {
            // COMBO / TEXT 등: code만 세팅
            defaults[metaKey] = code;
          }
        }

        // 캐시 저장 (reset 시 재적용용)
        moduleDefaultCacheRef.current = defaults;

        // state 키 → 대응 meta 찾기 (POPUP 의 _CD/코드명 쌍 포함).
        // 코드명 키는 충돌 시 `${base}__NM` 으로 분리되므로 popupNameKey 로 매칭.
        const findMetaForStateKey = (k: string): SearchMeta | undefined => {
          const popupByName = meta.find(
            (mm) => mm.type === "POPUP" && popupNameKey(mm.key, meta) === k,
          );
          if (popupByName) return popupByName;
          if (k.endsWith("_CD")) {
            const baseKey = k.replace(/_CD$/, "");
            const popup = meta.find(
              (mm) =>
                mm.type === "POPUP" && mm.key.replace("_CD", "") === baseKey,
            );
            if (popup) return popup;
          }
          return meta.find((mm) => mm.key === k);
        };

        setSearchState((prev) => {
          const next = { ...prev };
          for (const [k, v] of Object.entries(defaults)) {
            if (next[k]) {
              next[k] = { ...next[k], value: v };
            } else {
              // 사용자 입력이 없어 searchState에 없는 필드(COMBO/TEXT/POPUP _NM 등)에 기본값 세팅
              const mm = findMetaForStateKey(k);
              next[k] = {
                key: k,
                operator: "equal",
                dataType: mm?.dataType ?? "STRING",
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

  // ── DIV 변경 → 해당 부서의 기본(DFT_YN='Y') 물류운영그룹 자동 적용 ──
  //  모든 화면 공통: DIV_CD · LGST_GRP_CD 필드가 둘 다 있으면 자동 동작.
  //  (접두사 무관 매칭 — SRCH_DSPCH_DIV_CD / DTL.LGST_GRP_CD 등)
  const divMeta = useMemo(
    () => meta.find((m) => keyEndsWith(m.key, "DIV_CD")),
    [meta],
  );
  const lgstMeta = useMemo(
    () => meta.find((m) => keyEndsWith(m.key, "LGST_GRP_CD")),
    [meta],
  );
  const divValue = divMeta ? (searchState[divMeta.key]?.value ?? "") : "";
  const divInitRef = useRef(true);

  useEffect(() => {
    if (!divMeta || !lgstMeta) return;
    // 최초 1회(초기 로드 시점)는 스킵 — 사용자/기본값 로드로 DIV 가 "바뀐" 경우에만 적용.
    if (divInitRef.current) {
      divInitRef.current = false;
      return;
    }
    if (!divValue) return; // DIV 비면 클리어 유지(자식 cascade 가 비움)

    commonApi
      .searchDefaultLgstGrpValue({ DIV_CD: divValue })
      .then((res: any) => {
        const row = (res.data?.data?.dsOut ?? res.data?.result ?? [])[0];
        if (!row) return;
        const code = String(row.LGST_GRP_CD ?? "");
        const name = String(row.LGST_GRP_NM ?? "");
        if (!code) return;

        setSearchState((prev) => {
          const next = { ...prev };
          const dataType = lgstMeta.dataType ?? "STRING";
          if (lgstMeta.type === "POPUP") {
            const baseKey = lgstMeta.key.replace("_CD", "");
            next[`${baseKey}_CD`] = {
              key: `${baseKey}_CD`,
              operator: "equal",
              dataType,
              value: code,
              sourceType: "POPUP",
            };
            const nmKey = popupNameKey(lgstMeta.key, meta);
            next[nmKey] = {
              key: nmKey,
              operator: "equal",
              dataType: "STRING",
              value: name,
              sourceType: "POPUP",
            };
          } else {
            next[lgstMeta.key] = {
              key: lgstMeta.key,
              operator: "equal",
              dataType,
              value: code,
              sourceType: "NORMAL",
            };
          }
          return next;
        });
      })
      .catch((err: any) =>
        console.error("[SearchFilters] searchDefaultLgstGrpValue failed", err),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divValue]);
}
