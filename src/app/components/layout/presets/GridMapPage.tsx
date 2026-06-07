// src/app/components/layout/presets/GridMapPage.tsx
//
// SearchFilters + 그리드 + 지도 분할.
// 내부적으로 MasterDetailPage 와 동일 구조이나, 의도(grid + map)를 명시하기 위해 별도 export.
//
// InTrnstVehCtrl 용.

"use client";

import { ReactNode } from "react";
import { MasterDetailPage } from "./MasterDetailPage";
import type { SearchProps } from "./types";
import type { LayoutType } from "../LayoutToggleButton";

export interface GridMapPageProps {
  /** menuCode 전달 시 SearchMeta 자동 로드 + loading skeleton 자동. */
  menuCode?: string;
  searchProps: SearchProps;
  grid: ReactNode;
  map: ReactNode;
  defaultDirection: "horizontal" | "vertical";
  /** [grid, map] 비율 (default [50, 50]) */
  defaultSizes?: [number, number];
  storageKey?: string;
  breakpoint?: { mobile?: "horizontal" | "vertical"; maxWidth?: number };
}

export function GridMapPage({
  menuCode,
  searchProps,
  grid,
  map,
  defaultDirection,
  defaultSizes,
  storageKey,
  breakpoint,
}: GridMapPageProps) {
  return (
    <MasterDetailPage
      menuCode={menuCode}
      searchProps={searchProps}
      master={grid}
      detail={map}
      defaultDirection={defaultDirection}
      defaultSizes={defaultSizes}
      storageKey={storageKey}
      breakpoint={breakpoint}
    />
  );
}
