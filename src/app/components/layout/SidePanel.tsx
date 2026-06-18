// src/app/components/layout/SidePanel.tsx
//
// 화면 우측에 떠 있는 floating 패널 셸.
//   - dim 없음 → 뒤 화면(그리드 등) 계속 사용 가능
//   - 닫기는 헤더 X 버튼으로만 (외부 클릭으로 닫히지 않음)
//   - 본문은 호출자가 children 으로 직접 채운다
//
// title 은 언어팩 키를 그대로 넘긴다 — 문자열이면 내부에서 Lang.get 적용(라벨 규칙).

"use client";

import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Lang } from "@/app/services/common/Lang";

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  width?: number;
  side?: "right" | "left";
  children: ReactNode;
}

export function SidePanel({
  open,
  onClose,
  title,
  width = 420,
  side = "right",
  children,
}: SidePanelProps) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed top-0 h-full z-[60] bg-background shadow-2xl flex flex-col"
      style={{
        width,
        [side]: 0,
        ...(side === "right"
          ? { borderLeft: "1px solid var(--border)" }
          : { borderRight: "1px solid var(--border)" }),
      }}
    >
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border shrink-0">
        <span className="text-[13px] font-medium">
          {typeof title === "string" ? Lang.get(title) : title}
        </span>
        <button
          onClick={onClose}
          className="w-[26px] h-[26px] border border-input rounded-md bg-background flex items-center justify-center text-muted-foreground hover:bg-accent"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5">{children}</div>
    </div>,
    document.body,
  );
}
