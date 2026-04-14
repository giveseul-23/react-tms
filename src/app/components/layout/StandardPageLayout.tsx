// app/components/layout/StandardPageLayout.tsx
//
// 요구사항 5: 화면 공통 패턴을 하나의 컴포넌트로 통일
//
// 현재 TenderReceiveDispatch / MenuConfig 두 화면이 동일한 구조를 반복:
//   [SearchFilters(조회조건)] + [그리드 영역(단일 or 분할)]
//
// ┌─ StandardPageLayout ────────────────────────────────────────────┐
// │  <SearchFilters />                                              │
// │  ┌─ 그리드 영역 ──────────────────────────────────────────┐    │
// │  │  단일 그리드 (singleGrid)                              │    │
// │  │  OR                                                    │    │
// │  │  PanelGroup + PanelResizeHandle (dualGrid)             │    │
// │  └────────────────────────────────────────────────────────┘    │
// │  [선택적] 하단 슬라이드 패널 (bottomPanel)                     │
// └─────────────────────────────────────────────────────────────────┘
//
// Props:
//   meta          - SearchFilters 에 전달할 조회조건 메타
//   fetchFn       - 조회 API 함수
//   onSearch      - 조회 결과 콜백
//   searchRef     - 외부 조회 트리거 ref
//   filtersRef    - 현재 필터 파라미터 ref
//   pageSize      - 페이지 크기
//   excludeKeysRef- 검색조건 제외 키 ref (선택)
//   singleGrid    - 그리드가 1개인 경우 렌더링할 ReactNode
//   dualGrid      - 그리드가 2개인 경우 { top, bottom, layout, direction }
//   bottomPanel   - 하단 슬라이드 패널 (선택)
//   layout        - 레이아웃 상태 (dualGrid 전용)
//   onLayoutToggle- 레이아웃 토글 핸들러 (dualGrid 전용)

"use client";

import React, { ReactNode } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { SearchFilters } from "@/app/components/Search/SearchFilters";
import {
  LayoutToggleButton,
  LayoutType,
} from "@/app/components/layout/LayoutToggleButton";
import type { SearchMeta } from "@/features/search/search.meta.types";
import type { SearchResult } from "@/app/components/Search/SearchFilters";
import type { TreeGridHandle } from "@/app/components/grid/TreeGrid";

// ─── 단일 그리드 전용 Props ────────────────────────────────────────────────
interface SingleGridConfig {
  /** 그리드 컴포넌트를 렌더링하는 함수 또는 ReactNode */
  render: ReactNode;
}

// ─── 분할 그리드 전용 Props ────────────────────────────────────────────────
interface DualGridConfig {
  /** 상단(좌측) 패널 */
  top: ReactNode;
  /** 하단(우측) 패널 */
  bottom: ReactNode;
  /** 분할 방향 (레이아웃 상태에서 파생) */
  direction: "horizontal" | "vertical";
  /** 상단 패널 기본 비율 (default: 50) */
  defaultTopSize?: number;
  /** 하단 패널 기본 비율 (default: 50) */
  defaultBottomSize?: number;
}

// ─── 하단 슬라이드 패널 Props ─────────────────────────────────────────────
interface BottomSlidePanel {
  open: boolean;
  height?: number;
  render: ReactNode;
}

// ─── StandardPageLayout Props ─────────────────────────────────────────────
export interface StandardPageLayoutProps {
  // SearchFilters 관련
  meta: readonly SearchMeta[];
  fetchFn: (params: Record<string, unknown>) => Promise<any>;
  onSearch: (data: SearchResult) => void;
  searchRef?: React.MutableRefObject<((page?: number) => void) | null>;
  filtersRef?: React.MutableRefObject<Record<string, unknown>>;
  rawFiltersRef?: React.MutableRefObject<Record<string, string>>;
  treeGridRef?: React.MutableRefObject<TreeGridHandle>;
  pageSize?: number;
  excludeKeysRef?: React.MutableRefObject<Set<string>>;
  computeTotalCount?: (rows: any[]) => number;

  // 모듈 기본값 (센차 setModuleDefaultValue 대응)
  moduleDefault?: string;
  moduleDefaultParams?: Record<string, unknown>;
  moduleDefaultRemove?: string[];
  moduleDefaultSearchParams?: Record<string, string>;

  // 그리드: singleGrid XOR dualGrid 중 하나만 전달
  singleGrid?: SingleGridConfig;
  dualGrid?: DualGridConfig;

  // 레이아웃 토글 (dualGrid 일 때만 의미 있음)
  layout?: LayoutType;
  onLayoutToggle?: () => void;

  // 하단 슬라이드 패널 (선택)
  bottomPanel?: BottomSlidePanel;
}

export function StandardPageLayout({
  meta,
  fetchFn,
  onSearch,
  searchRef,
  filtersRef,
  rawFiltersRef,
  treeGridRef,
  pageSize = 20,
  excludeKeysRef,
  singleGrid,
  dualGrid,
  layout = "side",
  onLayoutToggle,
  bottomPanel,
  computeTotalCount,
  moduleDefault,
  moduleDefaultParams,
  moduleDefaultRemove,
  moduleDefaultSearchParams,
}: StandardPageLayoutProps) {
  // 그리드 개수 판별: dualGrid 가 있으면 2개, 없으면 1개
  const hasDualGrid = !!dualGrid;

  // LayoutToggleButton: 그리드가 2개 이상일 때만 표시 (요구사항 4 적용)
  const layoutToggleNode =
    hasDualGrid && onLayoutToggle ? (
      <LayoutToggleButton
        layout={layout}
        onToggle={onLayoutToggle}
        visible={true}
      />
    ) : (
      // 그리드 1개인 경우 visible=false 로 렌더링 자체를 막음
      <LayoutToggleButton
        layout={layout}
        onToggle={onLayoutToggle ?? (() => {})}
        visible={false}
      />
    );

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0">
      {/* ── 조회조건 ─────────────────────────────────────────────── */}
      <SearchFilters
        meta={meta}
        onSearch={onSearch}
        searchRef={searchRef}
        filtersRef={filtersRef}
        rawFiltersRef={rawFiltersRef}
        treeGridRef={treeGridRef}
        pageSize={pageSize}
        fetchFn={fetchFn}
        layoutToggle={layoutToggleNode}
        excludeKeysRef={excludeKeysRef}
        computeTotalCount={computeTotalCount}
        moduleDefault={moduleDefault}
        moduleDefaultParams={moduleDefaultParams}
        moduleDefaultRemove={moduleDefaultRemove}
        moduleDefaultSearchParams={moduleDefaultSearchParams}
      />

      {/* ── 그리드 영역 ─────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 min-w-0 overflow-x-visible mt-4">
        {hasDualGrid ? (
          // ── 분할 그리드 ─────────────────────────────────────────
          <PanelGroup
            direction={dualGrid!.direction}
            className="h-full w-full min-h-0 min-w-0"
          >
            <Panel
              defaultSize={dualGrid!.defaultTopSize ?? 50}
              minSize={20}
              className="min-h-0 min-w-0"
            >
              <div className="h-full flex flex-col overflow-hidden">
                {dualGrid!.top}
              </div>
            </Panel>

            <PanelResizeHandle
              className={
                dualGrid!.direction === "horizontal"
                  ? "w-2 cursor-col-resize hover:bg-slate-200/70"
                  : "h-2 cursor-row-resize hover:bg-slate-200/70"
              }
            />

            <Panel
              defaultSize={dualGrid!.defaultBottomSize ?? 50}
              minSize={20}
              className="min-h-0 min-w-0"
            >
              <div className="h-full flex flex-col overflow-hidden">
                {dualGrid!.bottom}
              </div>
            </Panel>
          </PanelGroup>
        ) : (
          // ── 단일 그리드 ─────────────────────────────────────────
          <div className="h-full flex flex-col overflow-hidden">
            {singleGrid?.render}
          </div>
        )}
      </div>

      {/* ── 하단 슬라이드 패널 (선택) ─────────────────────────── */}
      {/* Tailwind 동적 클래스(h-[Npx])는 JIT 빌드 없이 생성 안됨 → inline style 사용 */}
      {bottomPanel && (
        <div
          className="shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            height: bottomPanel.open ? `${bottomPanel.height ?? 280}px` : 0,
            opacity: bottomPanel.open ? 1 : 0,
          }}
        >
          {bottomPanel.render}
        </div>
      )}
    </div>
  );
}
