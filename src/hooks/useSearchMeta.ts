// src/hooks/useSearchMeta.ts
//
//  API 응답 형태 (실제 CSV 확인 기준):
//    키:  소문자  (dbcolumn, columndescr_lang, type, ...)
//    값:  대문자  (type: "COMBO", "TEXT", "YMD", "YMDT", "POPUP")

import { useEffect, useRef, useState } from "react";
import { commonApi, comboOptRequest } from "@/app/services/common/commonApi";
import { getSessionFields } from "@/app/services/auth/auth";
import type {
  SearchMeta,
  ServerSearchConditionRow,
} from "@/features/search/search.meta.types";

// 값이 대문자로 오므로 키도 대문자로 정의
const TYPE_MAP: Record<string, SearchMeta["type"]> = {
  TEXT: "TEXT",
  COMBO: "COMBO",
  POPUP: "POPUP",
  YMD: "YMD",
  YMDT: "YMDT",
  CHECK: "CHECKBOX",
};

const OPERATOR_MAP: Record<string, string> = {
  "1": "equal",
  "2": "percent",
  "3": "notEqual",
  "4": "parentheses",
  "5": "chevronRight",
  "6": "chevronLeft",
  "7": "chevronLast",
  "8": "chevronFirst",
};

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
function toSearchMeta(rows: ServerSearchConditionRow[]): SearchMeta[] {
  const sorted = [...rows].sort(
    (a, b) => Number(a.LINENUMBER) - Number(b.LINENUMBER),
  );

  return sorted.map((row): SearchMeta => {
    // 값이 대문자로 오므로 toUpperCase() 후 매핑
    const type: SearchMeta["type"] = TYPE_MAP[row.TYPE] ?? "TEXT";
    const condition = OPERATOR_MAP[String(row.OPERATOR)] ?? "equal";

    const base = {
      key: row.DBCOLUMN,
      label: row.COLUMNDESCR_LANG,
      span: calcSpan(Number(row.SRCHCONDTTLWDT)),
      required: row.REQUIREMENT === "Y",
      condition,
      conditionLocked: row.OPERATORFIX === "Y",
      dataType:
        (row.DATATYPE?.toLowerCase() as SearchMeta["dataType"]) ?? "STRING",
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

export function useSearchMeta(menuCode: string) {
  const [meta, setMeta] = useState<SearchMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const menuCodeRef = useRef(menuCode);
  menuCodeRef.current = menuCode;

  useEffect(() => {
    if (!menuCode) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { userId, sesUserId, ACCESS_TOKEN, sesLang } = getSessionFields();

      try {
        const condRes = await commonApi.fetchSearchCondition(
          menuCodeRef.current,
          sesLang,
          userId,
        );
        const rawRows: ServerSearchConditionRow[] =
          condRes.data?.data?.dsSearchCondition ?? [];

        const baseMeta = toSearchMeta(rawRows);

        // keyParam 이 없어도 sqlProp 이 있으면 콤보 요청 대상으로 포함
        const comboItems = baseMeta.filter(
          (m): m is Extract<SearchMeta, { type: "COMBO" }> =>
            m.type === "COMBO" && !!m.sqlProp,
        );

        if (comboItems.length === 0) {
          if (!cancelled) {
            setMeta(baseMeta);
            setLoading(false);
          }
          return;
        }

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

        const resolved = baseMeta.map((m) => {
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

          return { ...m, options };
        });

        if (!cancelled) setMeta(resolved);
      } catch (e) {
        console.error("[useSearchMeta] load failed", e);
        if (!cancelled) setMeta([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [menuCode]);

  return { meta, loading };
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

          return { ...m, options };
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseMetaKey]);

  return { meta, loading };
}
