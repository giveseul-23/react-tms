// src/app/components/layout/presets/GridOnlyPage.tsx
//
// SearchFilters + 단일 그리드(또는 단일 콘텐츠).
// MenuConfig, 그 외 단일 그리드 화면용.

"use client";

import { ReactNode } from "react";
import { PageShell } from "../PageShell";
import { Pane } from "../Pane";
import { SearchFilters } from "@/app/components/Search/SearchFilters";
import { LayoutToggleButton } from "../LayoutToggleButton";
import { useResolvedSearchMeta } from "@/app/feature/useResolvedSearchMeta";
import type { SearchProps } from "./types";

export interface GridOnlyPageProps {
  /** menuCode 전달 시 SearchMeta 자동 로드 + loading skeleton 자동. */
  menuCode?: string;
  searchProps: SearchProps;
  /** 메인 그리드 (또는 임의 콘텐츠) */
  grid: ReactNode;
}

export function GridOnlyPage({
  menuCode,
  searchProps,
  grid,
}: GridOnlyPageProps) {
  const { meta, gate } = useResolvedSearchMeta(
    menuCode,
    searchProps.meta,
    searchProps.loading,
  );
  if (gate) return <>{gate}</>;
  const finalSearchProps: SearchProps & { meta: NonNullable<SearchProps["meta"]> } =
    { menuCode, ...searchProps, meta };

  return (
    <PageShell
      searchSlot={
        <SearchFilters
          {...finalSearchProps}
          layoutToggle={
            <LayoutToggleButton
              layout="side"
              onToggle={() => {}}
              visible={false}
            />
          }
        />
      }
    >
      <Pane>{grid}</Pane>
    </PageShell>
  );
}
