// src/app/components/layout/presets/types.ts
//
// 프리셋 컴포넌트가 공통으로 받는 SearchFilters props.
// SearchFilters 의 props 와 동일하지만 layoutToggle 만 제외 (프리셋 내부에서 주입).

import type { ComponentProps } from "react";
import type { SearchFilters } from "@/app/components/Search/SearchFilters";

export type SearchProps = Omit<
  ComponentProps<typeof SearchFilters>,
  "layoutToggle"
>;
