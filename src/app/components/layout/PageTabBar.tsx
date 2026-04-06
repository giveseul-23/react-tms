// src/app/components/layout/PageTabBar.tsx
"use client";

import React, { useRef, useState } from "react";
import { X } from "lucide-react";
import type { PageTab } from "@/hooks/usePageTabs";

interface PageTabBarProps {
  tabs: PageTab[];
  activeMenuCode: string;
  onSelect: (menuCode: string) => void;
  onClose: (menuCode: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function PageTabBar({
  tabs,
  activeMenuCode,
  onSelect,
  onClose,
  onReorder,
}: PageTabBarProps) {
  if (tabs.length === 0) return null;

  const dragIndexRef = useRef<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    menuCode: string;
  } | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragIndexRef.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    // 마우스가 탭의 왼쪽 절반이면 → index 앞에 삽입
    // 오른쪽 절반이면 → index+1 앞에 삽입 (= index 뒤에)
    const rect = e.currentTarget.getBoundingClientRect();
    const half = rect.left + rect.width / 2;
    setDropIndex(e.clientX < half ? index : index + 1);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const fromIndex = dragIndexRef.current;
    if (fromIndex !== null && dropIndex !== null) {
      // 실제로 순서가 바뀌는 경우만 호출
      const to = dropIndex > fromIndex ? dropIndex - 1 : dropIndex;
      if (to !== fromIndex) {
        onReorder(fromIndex, to);
      }
    }
    dragIndexRef.current = null;
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDropIndex(null);
  };

  return (
    <div
      className="flex items-center bg-[rgb(var(--bg))] border-b border-gray-200 shrink-0 h-10"
      // 탭 바 맨 끝에 드롭할 수 있도록 바 자체도 처리
      onDragOver={(e) => {
        e.preventDefault();
        // 마지막 탭 오른쪽 영역 → 맨 끝에 삽입
        if ((e.target as HTMLElement).closest("[data-tab]") === null) {
          setDropIndex(tabs.length);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        const fromIndex = dragIndexRef.current;
        if (fromIndex !== null && dropIndex !== null) {
          const to = dropIndex > fromIndex ? dropIndex - 1 : dropIndex;
          if (to !== fromIndex) onReorder(fromIndex, to);
        }
        dragIndexRef.current = null;
        setDropIndex(null);
      }}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.menuCode === activeMenuCode;

        // 이 탭의 왼쪽에 인디케이터 표시 여부
        const showIndicatorBefore =
          dropIndex === index &&
          dragIndexRef.current !== index &&
          dragIndexRef.current !== index - 1;
        // 이 탭의 오른쪽(= 다음 탭 왼쪽)에 인디케이터 표시 여부
        const showIndicatorAfter =
          dropIndex === index + 1 &&
          dragIndexRef.current !== index &&
          dragIndexRef.current !== index + 1;

        return (
          <div
            key={tab.menuCode}
            data-tab={index}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              group relative flex items-center gap-1.5 px-4 h-full shrink-0
              text-[13px] cursor-grab active:cursor-grabbing select-none
              border-r border-gray-200 transition-colors
              ${
                isActive
                  ? "bg-white text-[rgb(var(--primary))] font-semibold border-b-2 border-b-[rgb(var(--primary))] -mb-px"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }
            `}
            style={{
              // 인디케이터: 왼쪽 또는 오른쪽에 파란 선
              borderLeft: showIndicatorBefore
                ? "2px solid rgb(var(--primary))"
                : undefined,
              borderRight: showIndicatorAfter
                ? "2px solid rgb(var(--primary))"
                : undefined,
            }}
            onClick={() => onSelect(tab.menuCode)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({
                x: e.clientX,
                y: e.clientY,
                menuCode: tab.menuCode,
              });
            }}
          >
            <span className="max-w-[120px] truncate">{tab.label}</span>

            {tabs.length > 1 && tab.menuCode !== "__WELCOME__" && (
              <button
                className={`
                  ml-0.5 rounded-full p-0.5
                  opacity-0 group-hover:opacity-100
                  ${isActive ? "opacity-60 hover:opacity-100" : ""}
                  hover:bg-gray-200 transition-opacity
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(tab.menuCode);
                }}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}

      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-[9990]"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-[9991] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 text-sm w-[120px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              disabled={contextMenu.menuCode === "__WELCOME__"}
              onClick={() => {
                onClose(contextMenu.menuCode);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              탭 닫기
            </button>
            <button
              onClick={() => {
                tabs
                  .filter(
                    (t) =>
                      t.menuCode !== contextMenu.menuCode &&
                      t.menuCode !== "__WELCOME__",
                  )
                  .forEach((t) => onClose(t.menuCode));
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              다른 탭 닫기
            </button>
            <button
              onClick={() => {
                tabs
                  .filter((t) => t.menuCode !== "__WELCOME__")
                  .forEach((t) => onClose(t.menuCode));
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              모든 탭 닫기
            </button>
          </div>
        </>
      )}
    </div>
  );
}
