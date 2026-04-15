// src/app/components/layout/PageShell.tsx
//
// 화면 외곽 셸. SearchFilters / 콘텐츠 / 하단 슬라이드 패널을 슬롯으로 받음.
// StandardPageLayout 외곽 골격과 byte-for-byte 동일.
//
// 사용:
//   <PageShell
//     searchSlot={<SearchFilters ... />}
//     bottomSlot={<TrackPanel />}
//     bottomOpen={open}
//   >
//     <SplitPane>...</SplitPane>
//   </PageShell>

"use client";

import { ReactNode } from "react";

export interface PageShellProps {
  /** 상단 조회조건 영역 (없어도 됨) */
  searchSlot?: ReactNode;
  /** 메인 콘텐츠 — 그리드 / SplitPane 등 */
  children: ReactNode;
  /** 하단 슬라이드 패널 */
  bottomSlot?: ReactNode;
  bottomOpen?: boolean;
  bottomHeight?: number;
}

export function PageShell({
  searchSlot,
  children,
  bottomSlot,
  bottomOpen = false,
  bottomHeight = 280,
}: PageShellProps) {
  return (
    <div className="flex flex-col h-full min-h-0 min-w-0">
      {searchSlot}

      <div className="flex-1 min-h-0 min-w-0 overflow-x-visible mt-4">
        {children}
      </div>

      {bottomSlot && (
        <div
          className="shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            height: bottomOpen ? `${bottomHeight}px` : 0,
            opacity: bottomOpen ? 1 : 0,
          }}
        >
          {bottomSlot}
        </div>
      )}
    </div>
  );
}
