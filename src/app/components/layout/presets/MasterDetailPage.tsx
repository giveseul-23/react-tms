// src/app/components/layout/presets/MasterDetailPage.tsx
//
// SearchFilters + 마스터/디테일 분할 (그리드 2개).
// 옵션:
//   - layoutToggle: side ↔ vertical 토글 버튼 표시
//   - bottomSlot: 하단 슬라이드 패널 (TenderReceiveDispatch 추적 패널 등)
//
// DispatchPlan / TenderReceiveDispatch 용.

"use client";

import { ReactNode } from "react";
import { PageShell } from "../PageShell";
import { Pane } from "../Pane";
import { SplitPane } from "../SplitPane";
import { SearchFilters } from "@/app/components/Search/SearchFilters";
import {
  LayoutToggleButton,
  type LayoutType,
} from "../LayoutToggleButton";
import type { SearchProps } from "./types";

export interface MasterDetailPageProps {
  searchProps: SearchProps;
  master: ReactNode;
  detail: ReactNode;
  /** "horizontal" | "vertical" */
  direction: "horizontal" | "vertical";
  /** [master, detail] 비율 (default [50, 50]) */
  defaultSizes?: [number, number];
  /** layout 토글 (옵션) */
  layoutToggle?: { layout: LayoutType; onToggle: () => void };
  /** 패널 비율 영속화 키 (옵션) */
  storageKey?: string;
  /** 반응형 (옵션) */
  breakpoint?: { mobile?: "horizontal" | "vertical"; maxWidth?: number };
  /** 하단 슬라이드 패널 (옵션) */
  bottomSlot?: ReactNode;
  bottomOpen?: boolean;
  bottomHeight?: number;
}

export function MasterDetailPage({
  searchProps,
  master,
  detail,
  direction,
  defaultSizes = [50, 50],
  layoutToggle,
  storageKey,
  breakpoint,
  bottomSlot,
  bottomOpen,
  bottomHeight,
}: MasterDetailPageProps) {
  const layoutToggleNode = layoutToggle ? (
    <LayoutToggleButton
      layout={layoutToggle.layout}
      onToggle={layoutToggle.onToggle}
      visible={true}
    />
  ) : (
    <LayoutToggleButton
      layout="side"
      onToggle={() => {}}
      visible={false}
    />
  );

  return (
    <PageShell
      searchSlot={
        <SearchFilters {...searchProps} layoutToggle={layoutToggleNode} />
      }
      bottomSlot={bottomSlot}
      bottomOpen={bottomOpen}
      bottomHeight={bottomHeight}
    >
      <SplitPane
        direction={direction}
        defaultSizes={defaultSizes}
        storageKey={storageKey}
        breakpoint={breakpoint}
      >
        <Pane>{master}</Pane>
        <Pane>{detail}</Pane>
      </SplitPane>
    </PageShell>
  );
}
