import {
  Equal,
  Percent,
  Parentheses,
  EqualNot,
  ChevronRight,
  ChevronLeft,
  ChevronLast,
  ChevronFirst,
  CircleSlash,
} from "lucide-react";

/**
 * condition 문자열 → 아이콘 컴포넌트 매핑
 */
export const CONDITION_ICON_MAP: Record<string, React.ElementType> = {
  equal: Equal,
  notEqual: EqualNot,
  percent: Percent,
  parentheses: Parentheses,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronLast: ChevronLast,
  chevronFirst: ChevronFirst,
  notUsed: CircleSlash,
};

/**
 * condition에 맞는 아이콘 반환
 * 없으면 Equal 기본값
 */
export function getConditionIcon(condition?: string) {
  return CONDITION_ICON_MAP[condition ?? "equal"] ?? Equal;
}
