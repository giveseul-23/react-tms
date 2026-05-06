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
import { OuterTabs, type OuterTab } from "../OuterTabs";
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
  /** SearchFilters 와 그리드 사이에 들어갈 슬롯 (예: 페이지 외부 탭) */
  topSlot?: ReactNode;
  /** 페이지 외부 탭 — 선언적으로 넘기면 자동으로 topSlot 위에 OuterTabs 가 렌더됨 */
  outerTabs?: {
    tabs: OuterTab[];
    activeTab: string;
    onChange: (key: string) => void;
  };
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
  topSlot,
  outerTabs,
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
      <div className="flex flex-col h-full min-h-0">
        {outerTabs && (
          <div className="shrink-0">
            <OuterTabs
              tabs={outerTabs.tabs}
              activeTab={outerTabs.activeTab}
              onChange={outerTabs.onChange}
            />
          </div>
        )}
        {topSlot && <div className="shrink-0">{topSlot}</div>}
        <div className="flex-1 min-h-0">
          <SplitPane
            direction={direction}
            defaultSizes={defaultSizes}
            storageKey={storageKey}
            breakpoint={breakpoint}
          >
            <Pane>{master}</Pane>
            <Pane>{detail}</Pane>
          </SplitPane>
        </div>
      </div>
    </PageShell>
  );
}
