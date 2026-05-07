// src/app/components/layout/presets/types.ts
//
// 프리셋 컴포넌트가 공통으로 받는 SearchFilters props.
// SearchFilters 의 props 와 동일하지만 layoutToggle 은 프리셋이 내부에서 주입.
// meta 는 optional 로 풀어 — preset 의 menuCode 로 자동 로드되는 케이스 지원.
// (직접 meta 를 넘기는 기존 화면도 그대로 동작 — preset 이 useResolvedSearchMeta 로
//  menuCode 우선, 없으면 searchProps.meta fallback)

import type { ComponentProps } from "react";
import type { SearchFilters } from "@/app/components/Search/SearchFilters";
import type { SearchMeta } from "@/features/search/search.meta.types";

export type SearchProps = Omit<
  ComponentProps<typeof SearchFilters>,
  "layoutToggle" | "meta"
> & {
  /** preset 에 menuCode 를 넘기면 자동 로드되므로 생략 가능. */
  meta?: readonly SearchMeta[];
};
