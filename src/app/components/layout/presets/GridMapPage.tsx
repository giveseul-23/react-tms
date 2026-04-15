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
  searchProps: SearchProps;
  grid: ReactNode;
  map: ReactNode;
  direction: "horizontal" | "vertical";
  /** [grid, map] 비율 (default [50, 50]) */
  defaultSizes?: [number, number];
  layoutToggle?: { layout: LayoutType; onToggle: () => void };
  storageKey?: string;
  breakpoint?: { mobile?: "horizontal" | "vertical"; maxWidth?: number };
}

export function GridMapPage({
  searchProps,
  grid,
  map,
  direction,
  defaultSizes,
  layoutToggle,
  storageKey,
  breakpoint,
}: GridMapPageProps) {
  return (
    <MasterDetailPage
      searchProps={searchProps}
      master={grid}
      detail={map}
      direction={direction}
      defaultSizes={defaultSizes}
      layoutToggle={layoutToggle}
      storageKey={storageKey}
      breakpoint={breakpoint}
    />
  );
}
