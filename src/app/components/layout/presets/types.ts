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
  /** menuCode 없이 직접 meta 를 로드하는 화면용 — 조회조건 응답 전 렌더를 막는 로딩 신호.
   *  preset 이 이 값으로 게이트(Skeleton) 처리. menuCode 경로의 useSearchMeta.loading 과 동일 역할.
   *  → 화면이 useSearchMeta 의 loading 을 여기로 넘기면 View 수동 게이트가 불필요. */
  loading?: boolean;
};
