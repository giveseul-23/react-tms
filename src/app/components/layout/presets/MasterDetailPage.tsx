// src/app/components/layout/presets/MasterDetailPage.tsx
//
// SearchFilters + 마스터/디테일 분할 (그리드 2개).
// 옵션:
//   - defaultDirection: 초기 분할 방향 (기본 "horizontal"). 토글값은 localStorage 자동 동기화
//   - layoutToggle: 토글 버튼 on/off (기본 true)
//   - bottomSlot: 하단 슬라이드 패널 (TenderReceiveDispatch 추적 패널 등)
//
// DispatchPlan / TenderReceiveDispatch 용.

"use client";

import { ReactNode, useCallback, useState } from "react";
import { PageShell } from "../PageShell";
import { Pane } from "../Pane";
import { SplitPane } from "../SplitPane";
import { SearchFilters } from "@/app/components/Search/SearchFilters";
import { MenuAuthProvider, isMenuDenied } from "@/app/feature/menuAuth";
import { LayoutToggleButton } from "../LayoutToggleButton";
import { OuterTabs, type OuterTab } from "../OuterTabs";
import { useResolvedSearchMeta } from "@/app/feature/useResolvedSearchMeta";
import type { SearchProps } from "./types";

type Direction = "horizontal" | "vertical";

export interface MasterDetailPageProps {
  /** menuCode 전달 시 SearchMeta 자동 로드 + loading skeleton 자동.
   *  생략하면 searchProps.meta 를 그대로 사용 (기존 호환). */
  menuCode?: string;
  searchProps: SearchProps;
  master: ReactNode;
  detail: ReactNode;
  /** 초기 분할 방향. 기본 "horizontal". 사용자 토글값은 localStorage 자동 저장. */
  defaultDirection?: Direction;
  /** [master, detail] 비율 (default [50, 50]) */
  defaultSizes?: [number, number];
  /** 토글 버튼 표시 여부. 기본 true. */
  layoutToggle?: boolean;
  /** 패널 비율 영속화 키. 방향값도 `${storageKey}-direction` 으로 자동 저장. */
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

// ── localStorage 안전 접근 ────────────────────────────────────
function readDirection(key: string): Direction | null {
  try {
    if (typeof window === "undefined") return null;
    const v = window.localStorage.getItem(key);
    return v === "horizontal" || v === "vertical" ? v : null;
  } catch {
    return null;
  }
}

function writeDirection(key: string, value: Direction): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function MasterDetailPage({
  menuCode,
  searchProps,
  master,
  detail,
  defaultDirection = "horizontal",
  defaultSizes = [50, 50],
  layoutToggle = true,
  storageKey,
  breakpoint,
  bottomSlot,
  bottomOpen,
  bottomHeight,
  topSlot,
  outerTabs,
}: MasterDetailPageProps) {
  const { meta, gate, menuAuth } = useResolvedSearchMeta(
    menuCode,
    searchProps.meta,
    searchProps.loading,
  );

  const directionKey = storageKey ? `${storageKey}-direction` : null;
  const [direction, setDirection] = useState<Direction>(() => {
    const saved = directionKey ? readDirection(directionKey) : null;
    return saved ?? defaultDirection;
  });
  const onToggleDirection = useCallback(() => {
    setDirection((prev) => {
      const next: Direction = prev === "horizontal" ? "vertical" : "horizontal";
      if (directionKey) writeDirection(directionKey, next);
      return next;
    });
  }, [directionKey]);

  if (gate) return <>{gate}</>;

  // 메뉴 권한 — 권한 매트릭스에 있는(통제 대상) 메뉴인데 내 그룹 권한이 전무하면 화면 숨김.
  // 매트릭스에 없으면(통제 대상 아님) 제한하지 않음 — 기존 화면 호환.
  const menuAccess = {
    controlled: !!menuCode && menuAuth.controlled.has(menuCode),
    flags: menuCode ? (menuAuth.byId[menuCode] ?? null) : null,
  };
  if (isMenuDenied(menuAccess)) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        접근 권한이 없습니다.
      </div>
    );
  }

  const finalSearchProps: SearchProps & { meta: NonNullable<SearchProps["meta"]> } =
    { menuCode, ...searchProps, meta };
  const layoutToggleNode = (
    <LayoutToggleButton
      layout={direction === "horizontal" ? "side" : "vertical"}
      onToggle={onToggleDirection}
      visible={layoutToggle}
    />
  );

  return (
    <MenuAuthProvider value={menuAuth}>
    <PageShell
      searchSlot={
        <SearchFilters {...finalSearchProps} layoutToggle={layoutToggleNode} />
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
    </MenuAuthProvider>
  );
}
