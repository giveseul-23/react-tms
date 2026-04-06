// app/components/popup/PopupShell.tsx
"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { PopupWidth } from "./popup.types";

interface PopupShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  width?: PopupWidth;
}

const WIDTH_PX: Record<PopupWidth, number> = {
  sm: 384,
  md: 448,
  lg: 512,
  xl: 576,
  "2xl": 672,
  "3xl": 768,
  "4xl": 896,
  full: 1200,
};

export function PopupShell({
  open,
  onOpenChange,
  title,
  children,
  width = "xl",
}: PopupShellProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setPos(null);
  }, [open]);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    dragging.current = true;
    const rect = dialogRef.current?.getBoundingClientRect();
    if (rect) {
      offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const w = dialogRef.current?.offsetWidth ?? 400;
      const h = dialogRef.current?.offsetHeight ?? 300;
      setPos({
        x: Math.max(
          0,
          Math.min(e.clientX - offset.current.x, window.innerWidth - w),
        ),
        y: Math.max(
          0,
          Math.min(e.clientY - offset.current.y, window.innerHeight - h),
        ),
      });
    };
    const onMouseUp = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  if (!open) return null;

  // ── 핵심: 뷰포트의 90% 를 넘지 않도록 높이 제한 ─────────────────────────
  // inline style 에서 height 관련 속성은 style 로만 처리 (Tailwind calc 는 JIT 빌드 필요)
  const baseStyle: React.CSSProperties = {
    maxWidth: WIDTH_PX[width],
    // 뷰포트 높이의 90% 로 제한 — 내용이 넘치면 Content 내부에서 스크롤
    maxHeight: "90vh",
    width: "100%",
    zIndex: 9999,
    // display:flex + flexDirection:column 을 inline으로 명시
    // (Tailwind flex flex-col 과 동일하지만 overflow 계산을 위해 명시)
    display: "flex",
    flexDirection: "column",
  };

  const dialogStyle: React.CSSProperties =
    pos === null
      ? {
          ...baseStyle,
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }
      : {
          ...baseStyle,
          position: "fixed",
          top: pos.y,
          left: pos.x,
        };

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-[9998]"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        style={dialogStyle}
        className="rounded-lg shadow-xl bg-white dark:bg-slate-800 overflow-hidden"
      >
        {/* Header — 항상 고정 표시, shrink 되지 않음 */}
        <div
          onMouseDown={onMouseDown}
          style={{ flexShrink: 0 }}
          className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-slate-700 cursor-grab active:cursor-grabbing select-none"
        >
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {title ?? ""}
          </span>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 hover:text-gray-800 dark:text-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/*
          Content 영역:
          - flex: 1 → 남은 높이를 모두 차지
          - overflow-y: auto → 내용이 넘칠 때 스크롤 발생
          - minHeight: 0 → flex 자식이 부모 높이를 초과하지 않도록
        */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            // justifyContent: "center",
          }}
          className="p-6"
        >
          {/* 내용물은 최대 width 를 채우면서 중앙 배치 */}
          <div style={{ width: "100%" }}>{children}</div>
        </div>
      </div>
    </>,
    document.body,
  );
}
