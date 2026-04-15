// src/app/components/layout/SplitPane.tsx
//
// react-resizable-panels 위의 얇은 어댑터.
//
// 특징:
//   - N개 children → N개 Panel + N-1 개 ResizeHandle 자동 생성
//   - direction: "horizontal" | "vertical"
//   - defaultSizes / minSizes 배열로 패널별 비율/최소 지정
//   - handleThickness: 핸들 두께 ("1.5" | "2") — 기존 화면별 스타일 보존용
//   - storageKey: react-resizable-panels의 autoSaveId 사용 → 사용자 리사이즈 비율을 localStorage에 저장
//   - breakpoint: { mobile: "stack" } 시 좁은 화면에서 자동으로 vertical 분할
//
// 자식은 자동으로 wrap 되지 않음. wrapper 필요하면 <Pane> 사용.

"use client";

import { Children, Fragment, ReactNode, useEffect, useState } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

type Direction = "horizontal" | "vertical";
type HandleThickness = "1.5" | "2";

// Tailwind purge가 인식하도록 정적 문자열 매핑
const HANDLE_CLASSNAMES: Record<Direction, Record<HandleThickness, string>> = {
  horizontal: {
    "1.5": "w-1.5 cursor-col-resize hover:bg-slate-200/70",
    "2": "w-2 cursor-col-resize hover:bg-slate-200/70",
  },
  vertical: {
    "1.5": "h-1.5 cursor-row-resize hover:bg-slate-200/70",
    "2": "h-2 cursor-row-resize hover:bg-slate-200/70",
  },
};

export interface SplitPaneProps {
  direction: Direction;
  defaultSizes?: number[];
  minSizes?: number[];
  /** 핸들 두께. 기본 "2" (StandardPageLayout과 동일). */
  handleThickness?: HandleThickness;
  /** 패널 비율 영속화. localStorage에 자동 저장/복원. */
  storageKey?: string;
  /** 반응형: 좁은 화면에서 분할 방향 강제 */
  breakpoint?: {
    /** mobile 폭(default 768px 미만)에서 적용할 direction */
    mobile?: Direction;
    /** 기준 폭 px (default 768) */
    maxWidth?: number;
  };
  className?: string;
  children: ReactNode | ReactNode[];
}

function useResponsiveDirection(
  base: Direction,
  breakpoint?: SplitPaneProps["breakpoint"],
): Direction {
  const maxWidth = breakpoint?.maxWidth ?? 768;
  const mobileDir = breakpoint?.mobile;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!mobileDir) return;
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [mobileDir, maxWidth]);

  return mobileDir && isMobile ? mobileDir : base;
}

export function SplitPane({
  direction,
  defaultSizes,
  minSizes,
  handleThickness = "2",
  storageKey,
  breakpoint,
  className,
  children,
}: SplitPaneProps) {
  const items = Children.toArray(children).filter(Boolean);
  const effectiveDirection = useResponsiveDirection(direction, breakpoint);
  const handleCls = HANDLE_CLASSNAMES[effectiveDirection][handleThickness];

  return (
    <PanelGroup
      direction={effectiveDirection}
      autoSaveId={storageKey}
      className={className ?? "h-full w-full min-h-0 min-w-0"}
    >
      {items.map((child, i) => (
        <Fragment key={i}>
          {i > 0 && <PanelResizeHandle className={handleCls} />}
          <Panel
            defaultSize={defaultSizes?.[i]}
            minSize={minSizes?.[i] ?? 20}
            className="min-h-0 min-w-0"
          >
            {child}
          </Panel>
        </Fragment>
      ))}
    </PanelGroup>
  );
}
