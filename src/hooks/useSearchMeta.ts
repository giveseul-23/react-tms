// src/hooks/useSearchMeta.ts
//
//  API 응답 형태 (실제 CSV 확인 기준):
//    키:  소문자  (dbcolumn, columndescr_lang, type, ...)
//    값:  대문자  (type: "COMBO", "TEXT", "YMD", "YMDT", "POPUP")

import { useCallback, useEffect, useRef, useState } from "react";
import { commonApi } from "@/app/services/common/commonApi";
import { getSessionFields, getUserGroupCodes } from "@/app/services/auth/auth";
import {
  decodeAuthFlags,
  orAuthFlags,
  type AuthFlags,
  type MenuAuth,
} from "@/app/feature/menuAuth";
import type {
  SearchMeta,
  ServerSearchConditionRow,
} from "@/features/search/search.meta.types";

// 값이 대문자로 오므로 키도 대문자로 정의
const TYPE_MAP: Record<string, SearchMeta["type"]> = {
  TEXT: "TEXT",
  COMBO: "COMBO",
  POPUP: "POPUP",
  Y: "Y",
  YM: "YM",
  YMD: "YMD",
  YMDT: "YMDT",
  CHECK: "CHECKBOX",
  CHECKBOX: "CHECKBOX",
};

// 서버 OPRT_TP 공통코드 NAME(SQL 연산자 문자열) → 아이콘 키
const OPERATOR_NAME_TO_ICON: Record<string, string> = {
  "=": "equal",
  LIKE: "percent",
  "<": "chevronLeft",
  "<=": "chevronFirst",
  ">": "chevronRight",
  ">=": "chevronLast",
  "<>": "notEqual",
  IN: "parentheses",
};

// CODE(서버 코드값) → 아이콘 키. OPRT_TP 공통코드 조회 결과로 동적 구성.
// 실패/미로딩 시 대비용 fallback.
const FALLBACK_OPERATOR_MAP: Record<string, string> = {
  "1": "equal",
  "2": "percent",
  "3": "notEqual",
  "4": "parentheses",
  "5": "chevronRight",
  "6": "chevronLeft",
  "7": "chevronLast",
  "8": "chevronFirst",
};

// OPRT_TP 공통코드는 거의 변하지 않으므로 모듈 스코프에 캐시
let oprtTpPromise: Promise<Record<string, string>> | null = null;

function loadOperatorMap(): Promise<Record<string, string>> {
  if (oprtTpPromise) return oprtTpPromise;

  const { userId, sesUserId, ACCESS_TOKEN, sesLang } = getSessionFields();
  oprtTpPromise = commonApi
    .fetchComboOptions([
      {
        key: "OPRT_TP",
        sqlProp: "CODE",
        keyParam: "OPRT_TP",
        sesUserId,
        userId,
        ACCESS_TOKEN,
        sesLang,
      },
    ])
    .then((res) => {
      const list: Array<{ CODE: string; NAME: string }> =
        res?.data?.data?.OPRT_TP ?? [];
      if (!list.length) return FALLBACK_OPERATOR_MAP;
      const map: Record<string, string> = {};
      list.forEach((item) => {
        const iconKey = OPERATOR_NAME_TO_ICON[item.NAME];
        if (iconKey) map[String(item.CODE)] = iconKey;
      });
      return Object.keys(map).length > 0 ? map : FALLBACK_OPERATOR_MAP;
    })
    .catch((e) => {
      console.error("[useSearchMeta] OPRT_TP load failed", e);
      oprtTpPromise = null; // 다음 호출에서 재시도 가능하도록 리셋
      return FALLBACK_OPERATOR_MAP;
    });

  return oprtTpPromise;
}

// "'2030','2040'" → ["2030","2040"]
function parseFilterValues(raw: string): string[] {
  if (!raw) return [];
  return (raw.match(/'([^']*)'/g) ?? []).map((v) => v.replace(/'/g, ""));
}

// srchcondttlwdt 숫자 → span 칸수
function calcSpan(wdt: number): number {
  if (!wdt) return 5;
  if (wdt <= 220) return 3;
  if (wdt <= 300) return 4;
  return 5;
}

// 서버 row → SearchMeta 변환
//  - 키 접근: 소문자 (row.dbcolumn, row.type ...)
//  - 값 비교: 대문자 (row.type === "COMBO" ...)
function toSearchMeta(
  rows: ServerSearchConditionRow[],
  operatorMap: Record<string, string>,
): SearchMeta[] {
  const sorted = [...rows].sort(
    (a, b) => Number(a.LINENUMBER) - Number(b.LINENUMBER),
  );

  return sorted.map((row): SearchMeta => {
    // 값이 대문자로 오므로 toUpperCase() 후 매핑
    const type: SearchMeta["type"] = TYPE_MAP[row.TYPE] ?? "TEXT";
    // OPERATOR 가 숫자 코드("2")면 operatorMap, SQL 문자열("LIKE","=")로 내려오는
    // 화면이면 OPERATOR_NAME_TO_ICON 으로 폴백
    const condition =
      operatorMap[String(row.OPERATOR)] ??
      OPERATOR_NAME_TO_ICON[String(row.OPERATOR)] ??
      "equal";

    const base = {
      key: row.DBCOLUMN,
      label: row.COLUMNDESCR_LANG,
      span: calcSpan(Number(row.SRCHCONDTTLWDT)),
      required: row.REQUIREMENT === "Y",
      condition,
      conditionLocked: row.OPERATORFIX === "Y",
      dataType: (row.DATATYPE as SearchMeta["dataType"]) ?? "STRING",
      // 모든 타입 공통 — 서버가 내려주는 동적 SQL 파라미터 참조
      sqlParam1: row.SQLPARAM1 || undefined,
      sqlParam2: row.SQLPARAM2 || undefined,
      sqlParam3: row.SQLPARAM3 || undefined,
      keyParam: row.KEYPARAM || undefined,
    };

    if (type === "COMBO") {
      return {
        ...base,
        type: "COMBO",
        sqlProp: row.SQLPROP,
        keyParam: row.KEYPARAM,
        includeAll: row.SRCHCONDALLYN === "Y",
        filterValues: parseFilterValues(row.OPRIN),
        defaultValue: row.DEFAULTVALUE || undefined,
        filterComponent: row.FLTRCMPONM || undefined,
        filterRefColumn: row.FLTRREFCOLNM || undefined,
      };
    }

    if (type === "POPUP") {
      return {
        ...base,
        type: "POPUP",
        sqlId: row.SQLPROP,
        filterComponent: row.FLTRCMPONM || undefined,
        filterRefColumn: row.FLTRREFCOLNM || undefined,
      };
    }

    if (type === "Y") {
      const rng = (row as any).RNGSRCHYN ?? (row as any).rngsrchyn ?? "Y";
      return {
        ...base,
        type: "Y",
        mode: rng === "N" ? "N" : "Y",
      };
    }

    if (type === "YM") {
      const rng = (row as any).RNGSRCHYN ?? (row as any).rngsrchyn ?? "Y";
      return {
        ...base,
        type: "YM",
        mode: rng === "N" ? "N" : "Y",
      };
    }

    if (type === "YMD") {
      const rng = (row as any).RNGSRCHYN ?? (row as any).rngsrchyn ?? "Y";
      return {
        ...base,
        type: "YMD",
        mode: rng === "N" ? "N" : "Y",
      };
    }

    if (type === "YMDT") {
      const rng = (row as any).RNGSRCHYN ?? (row as any).rngsrchyn ?? "Y";
      return {
        ...base,
        type: "YMDT",
        mode: rng === "N" ? "N" : "Y",
      };
    }

    if (type === "CHECKBOX") {
      return { ...base, type: "CHECKBOX" };
    }

    return { ...base, type: "TEXT" };
  });
}

// ─── optionMap에서 콤보 옵션을 찾는 헬퍼 ────────────────────────────────────
//
//  서버 응답의 optionMap 키 우선순위:
//  1) keyParam  (e.g. "DSPCH_OP_STS")   → 대부분의 경우
//  2) sqlProp   (e.g. "selectApplicationCode") → keyParam이 null인 경우
//  3) ""        (빈 문자열)              → 단일 콤보 응답인 경우
function resolveOptions(
  optionMap: Record<string, any[]>,
  keyParam: string | null | undefined,
  sqlProp: string | null | undefined,
): { CODE: string; NAME: string }[] {
  if (keyParam && optionMap[keyParam] != null) return optionMap[keyParam];
  if (sqlProp && optionMap[sqlProp] != null) return optionMap[sqlProp];
  if (optionMap[""] != null) return optionMap[""];
  return [];
}

function sanitizeComboOptions(
  options: { CODE: string; NAME: string }[],
): { CODE: string; NAME: string }[] {
  return options.filter((opt) => String(opt?.CODE ?? "").trim() !== "");
}

// 조회조건 로드 실패 시 재시도 — 화면을 반쪽으로 띄우지 않기 위함
const SEARCH_META_MAX_RETRY = 2;
const SEARCH_META_RETRY_DELAY = 700;

export function useSearchMeta(menuCode: string) {
  const [meta, setMeta] = useState<SearchMeta[]>([]);
  const [menuAuth, setMenuAuth] = useState<MenuAuth>(() => ({
    byId: {},
    controlled: new Set<string>(),
  }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const menuCodeRef = useRef(menuCode);
  menuCodeRef.current = menuCode;

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!menuCode) return;
    let cancelled = false;

    // 1회 시도 — 실패 시 throw (재시도는 load 가 담당)
    async function loadOnce(): Promise<{
      meta: SearchMeta[];
      menuAuth: MenuAuth;
    }> {
      const { userId, sesUserId, ACCESS_TOKEN, sesLang } = getSessionFields();

      const [condRes, operatorMap] = await Promise.all([
        commonApi.fetchSearchCondition(menuCodeRef.current, sesLang, userId),
        loadOperatorMap(),
      ]);
      const rawRows: ServerSearchConditionRow[] =
        condRes.data?.data?.dsSearchCondition ?? [];

      // 리소스 권한 — 같은 응답의 dsUserMenuAuth(모든 그룹 매트릭스)를
      //   byId: 내 그룹(USR_GRP_CD === 내 userGroup) 행만 디코드
      //   controlled: 매트릭스에 등장하는 authId 전체 (통제 대상 여부)
      // 내 그룹코드(USR_GRP_CD)로 명시된 행만 "부여된 권한"으로 인정한다.
      //   - 그룹코드 없음(undefined) = 시스템 기본값 → 제외 (부여 안 함 = 비활성)
      //   - 타 그룹(예: *DFT) → 제외
      //   - 내 그룹코드(다중이면 OR 합집합) → 적용
      // controlled: 매트릭스에 존재하는 authId 전체 = 통제 대상 여부.
      const myGroups = new Set(getUserGroupCodes());
      const byId: Record<string, AuthFlags> = {};
      const controlled = new Set<string>();
      for (const row of condRes.data?.data?.dsUserMenuAuth ?? []) {
        if (!row?.RSRC_ID) continue;
        controlled.add(row.RSRC_ID);
        const grp = (row.USR_GRP_CD ?? "").trim();
        if (!myGroups.has(grp)) continue; // 그룹없음/타그룹 제외, 내 그룹만 인정
        const flags = decodeAuthFlags(row.CONCAT_CNFG_VAL);
        byId[row.RSRC_ID] = byId[row.RSRC_ID]
          ? orAuthFlags(byId[row.RSRC_ID], flags)
          : flags;
      }
      const menuAuth: MenuAuth = { byId, controlled };

      const baseMeta = toSearchMeta(rawRows, operatorMap);

      // keyParam 이 없어도 sqlProp 이 있으면 콤보 요청 대상으로 포함
      const comboItems = baseMeta.filter(
        (m): m is Extract<SearchMeta, { type: "COMBO" }> =>
          m.type === "COMBO" && !!m.sqlProp,
      );

      if (comboItems.length === 0) return { meta: baseMeta, menuAuth };

      const comboRes = await commonApi.fetchComboOptions(
        comboItems.map((m) => ({
          key: m.keyParam ?? m.sqlProp,
          sqlProp: m.sqlProp,
          keyParam: m.keyParam ?? m.sqlProp,
          sesUserId,
          userId,
          ACCESS_TOKEN,
          sesLang,
        })),
      );

      const optionMap = comboRes?.data?.data ?? {}; // ← as any 제거

      const resolvedMeta = baseMeta.map((m) => {
        if (m.type !== "COMBO") return m;

        // keyParam → sqlProp → "" 순으로 fallback
        let options = resolveOptions(optionMap, m.keyParam, m.sqlProp);

        if (m.filterValues && m.filterValues.length > 0) {
          options = options.filter((opt) =>
            (
              m as Extract<SearchMeta, { type: "COMBO" }>
            ).filterValues!.includes(opt.CODE),
          );
        }

        if (m.includeAll) {
          options = [{ CODE: "ALL", NAME: "모두" }, ...options];
        }

        return { ...m, options: sanitizeComboOptions(options) };
      });

      return { meta: resolvedMeta, menuAuth };
    }

    async function load() {
      setLoading(true);
      setError(false);

      for (let attempt = 0; attempt <= SEARCH_META_MAX_RETRY; attempt++) {
        try {
          const resolved = await loadOnce();
          if (!cancelled) {
            setMeta(resolved.meta);
            setMenuAuth(resolved.menuAuth);
            setLoading(false);
          }
          return;
        } catch (e) {
          console.error(
            `[useSearchMeta] load failed (attempt ${attempt + 1}/${SEARCH_META_MAX_RETRY + 1})`,
            e,
          );
          if (cancelled) return;
          if (attempt < SEARCH_META_MAX_RETRY) {
            // loading 유지(skeleton 노출)한 채 잠시 후 재시도
            await new Promise((r) => setTimeout(r, SEARCH_META_RETRY_DELAY));
            if (cancelled) return;
          } else {
            // 재시도 소진 — 빈 화면 노출 대신 error 게이트 유지
            console.log("[SearchMeta] 재시도 소진 → error 게이트", menuCode);
            setMeta([]);
            setError(true);
            setLoading(false);
          }
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [menuCode, reloadKey]);

  return { meta, loading, error, retry, menuAuth };
}

export function useSearchMetaCode(baseMeta: readonly SearchMeta[]) {
  const [meta, setMeta] = useState<SearchMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const baseMetaKey = JSON.stringify(baseMeta.map((m) => m.key));
  const baseMetaRef = useRef(baseMeta);
  baseMetaRef.current = baseMeta;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { userId, sesUserId, ACCESS_TOKEN, sesLang } = getSessionFields();
      const currentMeta = baseMetaRef.current;

      const comboMetas = currentMeta.filter(
        (m) => m.type === "COMBO" && m.sqlProp,
      );

      if (comboMetas.length === 0) {
        if (!cancelled) {
          setMeta([...currentMeta]);
          setLoading(false);
        }
        return;
      }

      const emptyResolved = currentMeta.map((m) =>
        m.type === "COMBO" ? { ...m, options: [] } : m,
      );

      try {
        const payload = comboMetas.map((m) => ({
          key: m.keyParam ?? m.sqlProp,
          sqlProp: m.sqlProp!,
          keyParam: m.keyParam ?? m.sqlProp,
          sesUserId,
          userId,
          ACCESS_TOKEN,
          sesLang,
        }));

        const res = await commonApi.fetchComboOptions(payload);
        const optionMap = res?.data?.data ?? {}; // 그대로 유지

        const resolved = currentMeta.map((m) => {
          if (m.type !== "COMBO") return m;

          // keyParam → sqlProp → "" 순으로 fallback
          let options = resolveOptions(optionMap, m.keyParam, m.sqlProp);

          if (m.filterValues && Array.isArray(m.filterValues)) {
            options = options.filter((opt: any) =>
              m.filterValues.includes(opt.CODE),
            );
          }

          if (m.includeAll) {
            options = [{ CODE: "ALL", NAME: "모두" }, ...options];
          }

          return { ...m, options: sanitizeComboOptions(options) };
        });

        if (!cancelled) setMeta(resolved);
      } catch (e) {
        console.error("[useSearchMeta] fetchComboOptions failed", e);
        if (!cancelled) setMeta(emptyResolved);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [baseMetaKey]);

  return { meta, loading };
}
