// src/hooks/useSearchCondition.ts
//
// JS ExFieldSetSearchArea 의 조회조건 유틸 메서드 대응 훅.
//
//  [선언형 제외 + 파라미터 재조립]
//  ─────────────────────────────────────────────────────────────
//  excludes 에 문자열만 주면 단순 제외 (값은 extraParams 원본 키 그대로).
//  excludes 에 객체 { column, as, transform } 를 주면:
//    1) DYNAMIC_QUERY / dsSearchCondition 에서 제외
//    2) as 에 선언된 이름으로 top-level 리네임
//    3) transform 으로 값 가공 (예: 날짜 하이픈 제거)
//    → Controller 의 fetchList 에서 searchCondition.transformParams(params) 한 번만 호출하면 끝.
//
//  사용 예 (범위 YMD, JS buildOperatorArBillingHeaderParams 스타일):
//    useSearchCondition({
//      meta, excludeKeysRef, filtersRef,
//      excludes: [
//        {
//          column: "PLN.AR_TO_DT",                              // YMD 범위라 자동 _FRM/_TO 처리
//          as: { FROM: "AR_FROM_DT", TO: "AR_TO_DT" },          // top-level 이름
//          transform: (v) => String(v).replace(/-/g, ""),       // 하이픈 제거
//        },
//      ],
//    });
//
//  단순 제외 (BOOKING 같은 커스텀 필드):
//    useSearchCondition({ meta, excludeKeysRef, filtersRef, excludes: ["BOOKING"] });

import { useCallback, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import type { SearchMeta } from "@/features/search/search.meta.types";

export type ExcludeRename = {
  /** DBCOLUMN (meta.key). YMD 범위 타입이면 자동으로 _FRM / _TO 처리 */
  column: string;
  /** 단일 키: string (새 이름 하나).
   *  YMD 범위: { FROM, TO } (두 이름). 생략 시 값은 top-level 에서 빠짐. */
  as?: string | { FROM: string; TO: string };
  /** 값 변환 (ex: 하이픈 제거) */
  transform?: (value: unknown) => unknown;
};

export type ExcludeSpec = string | ExcludeRename;

export type UseSearchConditionArgs = {
  meta: readonly SearchMeta[];
  excludeKeysRef: MutableRefObject<Set<string>>;
  filtersRef?: MutableRefObject<Record<string, unknown>>;
  /** Mount 시 자동 등록. 문자열 or {column, as, transform} 형태 */
  excludes?: readonly ExcludeSpec[];
};

export type UseSearchConditionReturn = {
  setCompToParamExclude: (...dbColumns: string[]) => void;
  getValueByLabel: (label: string, fromOrTo?: "FROM" | "TO") => unknown;
  getValueByColumn: (dbColumn: string, fromOrTo?: "FROM" | "TO") => unknown;
  /**
   * Controller fetchList 에서 호출:
   *   const fetchList = (params) => api.getList(searchCondition.transformParams(params));
   * excludes 선언의 as / transform 에 따라 원본 키 삭제 후 새 이름으로 주입.
   */
  transformParams: (params: Record<string, unknown>) => Record<string, unknown>;
};

export function useSearchCondition({
  meta,
  excludeKeysRef,
  filtersRef,
  excludes,
}: UseSearchConditionArgs): UseSearchConditionReturn {
  const metaRef = useRef(meta);
  metaRef.current = meta;

  // excludes 구조 정규화 (string → {column})
  const specs = useMemo<ExcludeRename[]>(
    () =>
      (excludes ?? []).map((e) =>
        typeof e === "string" ? { column: e } : e,
      ),
    [excludes],
  );

  const isRangeYmd = useCallback((column: string) => {
    const m = metaRef.current.find((x) => x.key === column);
    return (
      !!m &&
      (m.type === "YMD" || m.type === "YMDT") &&
      (m as { mode?: string }).mode !== "N"
    );
  }, []);

  const setCompToParamExclude = useCallback(
    (...dbColumns: string[]) => {
      dbColumns.forEach((col) => {
        if (isRangeYmd(col)) {
          excludeKeysRef.current.add(col + "_FRM");
          excludeKeysRef.current.add(col + "_TO");
        } else {
          excludeKeysRef.current.add(col);
        }
      });
    },
    [excludeKeysRef, isRangeYmd],
  );

  // 선언형 자동 등록
  useEffect(() => {
    specs.forEach((s) => setCompToParamExclude(s.column));
  }, [specs, setCompToParamExclude, meta]);

  // filtersRef 에서 값 찾기. `.` <-> `_` 변형 둘 다 시도.
  const pickValue = useCallback(
    (key: string): unknown => {
      if (!filtersRef?.current) return undefined;
      const v = filtersRef.current[key];
      if (v !== undefined) return v;
      return filtersRef.current[key.replace(/\./g, "_")];
    },
    [filtersRef],
  );

  const getValueByColumn = useCallback(
    (dbColumn: string, fromOrTo?: "FROM" | "TO"): unknown => {
      let key = dbColumn;
      if (fromOrTo === "FROM") key += "_FRM";
      else if (fromOrTo === "TO") key += "_TO";
      return pickValue(key);
    },
    [pickValue],
  );

  const getValueByLabel = useCallback(
    (label: string, fromOrTo?: "FROM" | "TO"): unknown => {
      const m = metaRef.current.find((x) => x.label === label);
      if (!m) return undefined;
      return getValueByColumn(m.key, fromOrTo);
    },
    [getValueByColumn],
  );

  const transformParams = useCallback(
    (params: Record<string, unknown>): Record<string, unknown> => {
      const cleaned: Record<string, unknown> = { ...params };
      const identity = (v: unknown) => v;

      specs.forEach((spec) => {
        const { column, as, transform = identity } = spec;

        if (isRangeYmd(column)) {
          // _FRM / _TO 두 키 처리 (dot / underscore 변형 모두)
          const frmKey = column + "_FRM";
          const toKey = column + "_TO";
          const frmKeyUs = frmKey.replace(/\./g, "_");
          const toKeyUs = toKey.replace(/\./g, "_");

          const frmVal =
            cleaned[frmKey] ?? cleaned[frmKeyUs];
          const toVal = cleaned[toKey] ?? cleaned[toKeyUs];

          delete cleaned[frmKey];
          delete cleaned[toKey];
          delete cleaned[frmKeyUs];
          delete cleaned[toKeyUs];

          if (as && typeof as === "object") {
            if (frmVal !== undefined && frmVal !== "")
              cleaned[as.FROM] = transform(frmVal);
            if (toVal !== undefined && toVal !== "")
              cleaned[as.TO] = transform(toVal);
          }
        } else {
          const keyUs = column.replace(/\./g, "_");
          const val = cleaned[column] ?? cleaned[keyUs];

          delete cleaned[column];
          delete cleaned[keyUs];

          if (typeof as === "string") {
            if (val !== undefined && val !== "")
              cleaned[as] = transform(val);
          }
        }
      });

      return cleaned;
    },
    [specs, isRangeYmd],
  );

  return {
    setCompToParamExclude,
    getValueByLabel,
    getValueByColumn,
    transformParams,
  };
}
