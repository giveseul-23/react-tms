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
};

export type ActionGroup = {
  type: "group";
  key: string;
  label?: string;
  items: ActionButton[];
  disabled?: boolean;
};

export type ActionItem = ActionButton | ActionGroup;

function cls(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

/* =======================
 * GridActionsBar
 * ======================= */
export function GridActionsBar({
  actions,
  className,
}: {
  actions: ActionItem[];
  className?: string;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [dropdownStyle, setDropdownStyle] =
    useState<React.CSSProperties | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  if (!actions?.length) return null;

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

  const openGroup = actions.find(
    (a): a is ActionGroup => a.type === "group" && a.key === openKey,
  );

  return (
    <div className={cls("relative px-4 py-2 min-w-0", className)}>
      <div
        ref={scrollRef}
        className="
          min-w-0
          overflow-x-auto
          overflow-y-hidden
          scrollbar-none
          flex
        "
        onWheel={(e) => {
          if (!scrollRef.current) return;

          // 세로 휠 → 가로 스크롤 변환
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            scrollRef.current.scrollLeft += e.deltaY;
            e.preventDefault();
          }
        }}
      >
        <div className="inline-flex min-w-max items-center gap-1 whitespace-nowrap ml-auto">
          {actions.map((a) =>
            a.type === "group" ? (
              <Button
                key={a.key}
                type="button"
                variant="outline"
                className="h-8 px-2 py-1 text-xs gap-1"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();

                  setAnchorEl(e.currentTarget);
                  setDropdownStyle({
                    position: "fixed",
                    top: rect.bottom + 4,
                    left: rect.right - 180,
                    width: 180,
                    zIndex: 9999,
                  });

                  setOpenKey((prev) => (prev === a.key ? null : a.key));
                }}
              >
                {openKey === a.key ? (
                  <SquareMinus className="w-4 h-4" />
                ) : (
                  <SquarePlus className="w-4 h-4" />
                )}
                {a.label}
              </Button>
            ) : (
              <Button
                key={a.key}
                type="button"
                variant="outline"
                className="h-8 px-2 py-1 text-xs"
                onClick={a.onClick}
              >
                {a.label}
              </Button>
            ),
          )}
        </div>
      </div>

      {/* ✅ 드롭다운 */}
      {openGroup &&
        dropdownStyle &&
        createPortal(
          <div
            data-dropdown
            className="rounded-md border border-gray-200 bg-[rgb(var(--bg))] shadow-lg p-1"
            style={dropdownStyle}
          >
            {openGroup.items.map((it) => (
              <button
                key={it.key}
                type="button"
                disabled={it.disabled}
                onClick={() => {
                  it.onClick?.();
                  setOpenKey(null);
                }}
                className="w-full rounded-md px-2 py-2 text-left text-xs hover:bg-gray-100 disabled:opacity-50"
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
