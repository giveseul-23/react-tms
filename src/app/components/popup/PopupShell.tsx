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
  sm:    384,
  md:    448,
  lg:    512,
  xl:    576,
  "2xl": 672,
  "3xl": 768,
  "4xl": 896,
  full:  1200,
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

  // 팝업 열릴 때마다 중앙으로 초기화
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
        x: Math.max(0, Math.min(e.clientX - offset.current.x, window.innerWidth - w)),
        y: Math.max(0, Math.min(e.clientY - offset.current.y, window.innerHeight - h)),
      });
    };
    const onMouseUp = () => { dragging.current = false; };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  if (!open) return null;

  const dialogStyle: React.CSSProperties = pos === null
    ? {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: WIDTH_PX[width],
        maxHeight: "90vh",
        width: "100%",
        zIndex: 9999,
      }
    : {
        position: "fixed",
        top: pos.y,
        left: pos.x,
        maxWidth: WIDTH_PX[width],
        maxHeight: "90vh",
        width: "100%",
        zIndex: 9999,
      };

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-[9998]"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog — flex-col으로 자식이 높이를 채울 수 있게 */}
      <div
        ref={dialogRef}
        style={dialogStyle}
        className="rounded-lg shadow-xl bg-white dark:bg-slate-800 flex flex-col overflow-hidden"
      >
        {/* Header / 드래그 핸들 */}
        <div
          onMouseDown={onMouseDown}
          className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-slate-700 cursor-grab active:cursor-grabbing select-none shrink-0"
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

        {/* Content — flex-1로 남은 높이 채우고, 자식이 h-full 쓸 수 있도록 min-h-0 */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}
