// src/app/components/layout/Pane.tsx
//
// SplitPane 의 자식으로 명시적으로 사용하는 영역 wrapper.
// 기존 StandardPageLayout이 자동으로 감싸던 div와 동일한 클래스.
//
// 사용:
//   <SplitPane>
//     <Pane><DataGrid ... /></Pane>   ← wrapper 필요한 경우
//     <DataGrid ... />                ← wrapper 불필요한 경우 (직접)
//   </SplitPane>

"use client";

import { ReactNode } from "react";
import { cn } from "@/app/components/ui/utils";

export interface PaneProps {
  children: ReactNode;
  className?: string;
}

export function Pane({ children, className }: PaneProps) {
  return (
    <div className={cn("h-full flex flex-col overflow-hidden", className)}>
      {children}
    </div>
  );
}
