"use client";

import { createPortal } from "react-dom";
import React, { useEffect, useRef, useState } from "react";
import { SquareMinus, SquarePlus } from "lucide-react";
import { Button } from "@/app/components/ui/button";

/* =======================
 * Types
 * ======================= */
export type ActionButton = {
  type: "button";
  key: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Button variant (선택). 미지정 시 "outline". */
  variant?: "default" | "outline" | "primary" | "ghost" | "destructive";
};

export type ActionGroup = {
  /** "dropdown" 은 "group" 과 동일하게 렌더 (의미상 별칭). */
  type: "group" | "dropdown";
  key: string;
  label?: string;
  items: ActionButton[];
  disabled?: boolean;
};

export type ActionItem = ActionButton | ActionGroup;

/** 그룹/드롭다운 type guard — 렌더링 분기에서 사용. */
const isGroupLike = (a: ActionItem): a is ActionGroup =>
  a.type === "group" || a.type === "dropdown";

function cls(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

/** 텍스트 너비 측정 후 드롭다운 최소 너비 계산 */
function calcDropdownWidth(items: ActionButton[]): number {
  if (typeof document === "undefined") return 120;
  const span = document.createElement("span");
  span.style.cssText =
    "position:absolute;visibility:hidden;white-space:nowrap;font:11px Pretendard,-apple-system,BlinkMacSystemFont,sans-serif;";
  document.body.appendChild(span);
  let max = 0;
  for (const item of items) {
    span.textContent = item.label;
    const w = span.offsetWidth;
    if (w > max) max = w;
  }
  document.body.removeChild(span);
  // px-3(12px) * 2 + 여유 4px
  return max + 24 + 4;
}

/* =======================
 * GridActionsBar
 * ======================= */
export function GridActionsBar({
  actions,
  subTitle,
  className,
}: {
  actions: ActionItem[];
  subTitle?: string;
  className?: string;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [dropdownStyle, setDropdownStyle] =
    useState<React.CSSProperties | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!openKey) return;

    const handler = (e: PointerEvent) => {
      if (
        anchorEl &&
        (anchorEl.contains(e.target as Node) ||
          (e.target as HTMLElement).closest("[data-dropdown]"))
      ) {
        return;
      }
      setOpenKey(null);
    };

    window.addEventListener("pointerdown", handler, true);
    return () => window.removeEventListener("pointerdown", handler, true);
  }, [openKey, anchorEl]);

  if (!actions?.length) return null;

  const openGroup = actions.find(
    (a): a is ActionGroup => isGroupLike(a) && a.key === openKey,
  );

  return (
    <div ref={barRef} className={cls("relative px-2 py-1 min-w-0 flex items-center", className)}>
      {subTitle && (
        <span className="shrink-0 text-[11px] font-semibold text-[rgb(var(--primary))] mr-2">
          {subTitle}
        </span>
      )}
      <div
        ref={scrollRef}
        className="
          min-w-0
          overflow-x-auto
          overflow-y-hidden
          scrollbar-none
          flex
          flex-1
        "
        onWheel={(e) => {
          if (!scrollRef.current) return;
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            scrollRef.current.scrollLeft += e.deltaY;
            e.preventDefault();
          }
        }}
      >
        <div className="inline-flex min-w-max items-center gap-1 whitespace-nowrap ml-auto">
          {actions.map((a) =>
            isGroupLike(a) ? (
              <Button
                key={a.key}
                type="button"
                variant="outline"
                className="h-6 px-2 !py-0 text-[11px] leading-none gap-1 !rounded-md items-center [&_svg]:size-3 [&_svg]:shrink-0"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const barRect = barRef.current?.closest(".border")?.getBoundingClientRect();
                  const dropdownWidth = calcDropdownWidth(a.items);
                  const leftAligned = rect.left;
                  const gridRight = barRect?.right ?? window.innerWidth;
                  const left = leftAligned + dropdownWidth > gridRight
                    ? rect.right - dropdownWidth
                    : leftAligned;
                  // 아래 공간 부족 시 위로 열기
                  const estimatedHeight = a.items.length * 26 + 30;
                  const fitsBelow = rect.bottom + 4 + estimatedHeight <= window.innerHeight;
                  setAnchorEl(e.currentTarget);
                  setDropdownStyle({
                    position: "fixed",
                    ...(fitsBelow
                      ? { top: rect.bottom + 4 }
                      : { bottom: window.innerHeight - rect.top + 4 }),
                    left,
                    minWidth: dropdownWidth,
                    whiteSpace: "nowrap" as const,
                    zIndex: 9999,
                  });
                  setOpenKey((prev) => (prev === a.key ? null : a.key));
                }}
              >
                {openKey === a.key ? <SquareMinus /> : <SquarePlus />}
                {a.label}
              </Button>
            ) : (
              <Button
                key={a.key}
                type="button"
                variant={(a.variant ?? "outline") as any}
                disabled={a.disabled}
                className="h-6 px-2 !py-0 text-[11px] leading-none !rounded-md items-center [&_svg]:size-3 [&_svg]:shrink-0 disabled:opacity-50"
                onClick={a.onClick}
              >
                {a.label}
              </Button>
            ),
          )}
        </div>
      </div>

      {/* 드롭다운 */}
      {openGroup &&
        dropdownStyle &&
        createPortal(
          <div
            data-dropdown
            className="flex flex-col rounded-md border border-gray-200 bg-[rgb(var(--bg))] shadow-md py-1"
            style={dropdownStyle}
          >
            {/* 상위 그룹 제목 */}
            <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-0.5">
              {openGroup.label}
            </div>
            {/* 하위 버튼 */}
            {openGroup.items.map((it) => (
              <button
                key={it.key}
                type="button"
                disabled={it.disabled}
                onClick={() => {
                  it.onClick?.();
                  setOpenKey(null);
                }}
                className="w-full rounded-md px-3 py-1.5 text-[11px] text-left hover:bg-gray-100 dark:hover:text-slate-900 disabled:opacity-50"
              >
                {it.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
