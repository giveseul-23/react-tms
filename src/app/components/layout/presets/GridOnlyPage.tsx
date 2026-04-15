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
import type { SearchProps } from "./types";

export interface GridOnlyPageProps {
  searchProps: SearchProps;
  /** 메인 그리드 (또는 임의 콘텐츠) */
  grid: ReactNode;
}

export function GridOnlyPage({ searchProps, grid }: GridOnlyPageProps) {
  return (
    <PageShell
      searchSlot={
        <SearchFilters
          {...searchProps}
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
