// src/app/components/Search/SearchFilters/fieldRules.ts
//
// 조회조건 필드의 "활성 조건(enableWhen)" 선언 규칙.
//   다른 필드의 값에 따라 특정 필드를 활성/비활성(+필수/자동클리어)한다.
//   화면별 커스텀 컴포넌트를 포크하지 않고, SearchFilters 에 fieldRules prop 으로 선언만 하면 된다.
//
//   fieldRules: Record<대상필드 key, FieldRule>
//     - 여러 "필드" → Record 항목을 늘린다.
//     - 한 "필드의 여러 조건" → enableWhen 을 배열(AND)로 준다.

import type { SearchMeta } from "@/features/search/search.meta.types";
import { popupNameKey } from "@/features/search/search.builder";

/** 활성 조건 한 개 — 다른 필드 값 기준. */
export interface EnableCondition {
  /** 제어 필드 state key (예: "AR_TRF_LCD"). */
  field: string;
  /** 이 값(들)일 때 만족. 배열이면 OR. */
  equals?: string | string[];
  /** true 면 해당 필드가 채워져 있어야 만족. equals 와 함께 쓰면 둘 다 만족해야 함. */
  filled?: boolean;
}

/** 대상 필드의 활성/필수/클리어 규칙. */
export interface FieldRule {
  /** 활성 조건 — 배열이면 모두(AND) 만족해야 활성. */
  enableWhen: EnableCondition | EnableCondition[];
  /** 활성일 때 required 로 표시/검증. */
  requiredWhenEnabled?: boolean;
  /** 비활성 시 값 자동 클리어 (기본 true). */
  clearOnDisable?: boolean;
}

export type FieldRules = Record<string, FieldRule>;

type GetCondition = (key: string) => { value?: string } | undefined;

const norm = (v: unknown) => String(v ?? "").trim();

function conditionMet(cond: EnableCondition, get: GetCondition): boolean {
  const v = norm(get(cond.field)?.value);
  if (cond.equals != null) {
    const arr = Array.isArray(cond.equals) ? cond.equals : [cond.equals];
    if (!arr.map(String).includes(v)) return false;
  }
  // filled 명시 또는 (equals 미지정) → 값이 채워져 있어야 함
  if (cond.filled || cond.equals == null) {
    if (v === "" || v === "ALL") return false;
  }
  return true;
}

/** 규칙 만족(=활성) 여부. enableWhen 배열은 모두 만족해야 활성. */
export function isRuleEnabled(rule: FieldRule, get: GetCondition): boolean {
  const conds = Array.isArray(rule.enableWhen)
    ? rule.enableWhen
    : [rule.enableWhen];
  return conds.every((c) => conditionMet(c, get));
}

/** 대상 필드(meta.key)의 실제 state 키들 — 값 클리어/제외/입력차단 대상.
 *  POPUP → `${base}_CD` + 코드명키, 날짜 범위(Y) → `_FRM`/`_TO`, 그 외 → key. */
export function stateKeysOfField(
  meta: readonly SearchMeta[],
  targetKey: string,
): string[] {
  const m = meta.find((x) => x.key === targetKey);
  if (!m) return [targetKey];
  if (m.type === "POPUP") {
    const base = m.key.replace(/_CD$/, "");
    return [`${base}_CD`, popupNameKey(m.key, meta)];
  }
  if (
    (m.type === "Y" || m.type === "YM" || m.type === "YMD" || m.type === "YMDT") &&
    m.mode !== "N"
  ) {
    return [`${m.key}_FRM`, `${m.key}_TO`];
  }
  return [m.key];
}

/** fieldRules 로부터 계산:
 *   - disabledTargets   : 비활성 대상 meta key (시각 disable + 조건아이콘 잠금)
 *   - disabledStateKeys : 비활성 대상의 state 키 전체 (입력 차단용 — clearOnDisable 무관, 비활성이면 입력 막음)
 *   - clearStateKeys    : 그 중 clearOnDisable !== false 인 대상의 state 키 (자동 클리어 + 쿼리 제외용)
 */
export function computeDisabled(
  meta: readonly SearchMeta[],
  fieldRules: FieldRules | undefined,
  get: GetCondition,
): {
  disabledTargets: Set<string>;
  disabledStateKeys: Set<string>;
  clearStateKeys: Set<string>;
} {
  const disabledTargets = new Set<string>();
  const disabledStateKeys = new Set<string>();
  const clearStateKeys = new Set<string>();
  if (!fieldRules)
    return { disabledTargets, disabledStateKeys, clearStateKeys };
  for (const [targetKey, rule] of Object.entries(fieldRules)) {
    if (isRuleEnabled(rule, get)) continue;
    disabledTargets.add(targetKey);
    const keys = stateKeysOfField(meta, targetKey);
    for (const k of keys) disabledStateKeys.add(k);
    // clearOnDisable 기본 true — false 로 명시한 대상만 값 보존(클리어/제외 대상에서 뺌)
    if (rule.clearOnDisable !== false) {
      for (const k of keys) clearStateKeys.add(k);
    }
  }
  return { disabledTargets, disabledStateKeys, clearStateKeys };
}
