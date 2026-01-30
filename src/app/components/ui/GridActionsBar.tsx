"use client";

import React, { useEffect, useRef, useState } from "react";
import { SquareMinus, SquarePlus } from "lucide-react";
import { Button } from "@/app/components/ui/button";

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

/**
 * ✅ 바깥 클릭 감지: pointerdown + capture로 안정화
 * - 패널 드래그/모바일 터치에서도 잘 동작
 * - trigger/menu 내부 클릭은 무시
 */
function useClickOutside(
  triggerWrapRef: React.RefObject<HTMLElement>,
  menuRef: React.RefObject<HTMLElement>,
  onClose: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: PointerEvent) => {
      const path = (e.composedPath?.() ?? []) as EventTarget[];

      const inTrigger =
        !!triggerWrapRef.current && path.includes(triggerWrapRef.current);
      const inMenu = !!menuRef.current && path.includes(menuRef.current);

      if (!inTrigger && !inMenu) onClose();
    };

    // capture로 받아야 안정적(패널 드래그/터치 포함)
    window.addEventListener("pointerdown", handler, true);
    return () => window.removeEventListener("pointerdown", handler, true);
  }, [enabled, onClose, triggerWrapRef, menuRef]);
}

function GroupButton({
  group,
  open,
  onToggle,
  onClose,
}: {
  group: ActionGroup;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const triggerWrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(triggerWrapRef, menuRef, onClose, open);

  return (
    <div className="relative">
      {/* ✅ Button ref 대신 wrapper ref */}
      <div ref={triggerWrapRef} className="inline-flex">
        <Button
          type="button"
          variant="outline"
          disabled={group.disabled}
          className="h-8 px-2 py-1 text-sm gap-1"
          onClick={onToggle}
        >
          {open ? (
            <SquareMinus className="w-4 h-4" />
          ) : (
            <SquarePlus className="w-4 h-4" />
          )}
          {group.label ? <span>{group.label}</span> : null}
        </Button>
      </div>

      {open && (
        <div
          ref={menuRef}
          className={cls(
            "absolute right-0 mt-2 z-50",
            "min-w-[180px] rounded-md border border-gray-200 bg-[rgb(var(--bg))] shadow-lg p-1",
          )}
        >
          {group.items.map((it) => (
            <button
              key={it.key}
              type="button"
              disabled={it.disabled}
              onClick={() => {
                it.onClick?.();
                onClose();
              }}
              className={cls(
                "w-full rounded-md px-2 py-2 text-left text-sm",
                "hover:bg-gray-100",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function GridActionsBar({
  actions,
  className,
}: {
  actions: ActionItem[];
  className?: string;
}) {
  const [openGroupKey, setOpenGroupKey] = useState<string | null>(null);

  if (!actions || actions.length === 0) return null;

  // ✅ 핵심: open -> !open 토글 (prev 기반)
  const toggleGroup = (key: string) => {
    setOpenGroupKey((prev) => (prev === key ? null : key));
  };

  return (
    <div
      className={cls(
        "shrink-0 flex items-center justify-end px-4 py-3",
        className,
      )}
    >
      <div className="flex items-center gap-1">
        {actions.map((a) => {
          if (a.type === "group") {
            const open = openGroupKey === a.key;

            return (
              <GroupButton
                key={a.key}
                group={a}
                open={open}
                onToggle={() => toggleGroup(a.key)} // ✅ 여기
                onClose={() => setOpenGroupKey(null)}
              />
            );
          }

          return (
            <Button
              key={a.key}
              type="button"
              variant="outline"
              disabled={a.disabled}
              className="h-8 px-2 py-1 text-sm"
              onClick={a.onClick}
            >
              {a.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
