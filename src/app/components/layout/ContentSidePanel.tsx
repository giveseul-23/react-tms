"use client";

// 콘텐츠 영역 안에 갇히는 우측(좌측) 슬라이드 패널 셸.
//  공용 SidePanel(body portal + position:fixed) 과 달리 position:absolute 로 렌더되어
//  "가장 가까운 positioned ancestor"(= 메뉴 콘텐츠 컨테이너) 범위 안에만 존재한다.
//  → 헤더/탭바를 덮지 않고, 콘텐츠가 display:none 이면 패널도 함께 사라진다.
//  사용처는 부모가 position:relative/absolute 인 콘텐츠 컨테이너여야 한다(HomePage 메뉴 div 충족).

import { ReactNode } from "react";
import { X } from "lucide-react";
import { Lang } from "@/app/services/common/Lang";

interface ContentSidePanelProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  width?: number;
  side?: "right" | "left";
  children: ReactNode;
}

export function ContentSidePanel({
  open,
  onClose,
  title,
  width = 520,
  side = "right",
  children,
}: ContentSidePanelProps) {
  if (!open) return null;

  return (
    <div
      className="absolute top-0 h-full z-40 bg-background shadow-2xl flex flex-col"
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

      <div className="flex-1 min-h-0 overflow-y-auto p-3.5">{children}</div>
    </div>
  );
}
