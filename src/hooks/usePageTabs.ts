// src/hooks/usePageTabs.ts
import { useState, useCallback } from "react";

export type PageTab = {
  menuCode: string;
  label: string;
};

export function usePageTabs(
  initialMenuCode: string,
  initialLabel: string,
  maxTabs: number = 20,
) {
  const [tabs, setTabs] = useState<PageTab[]>([
    { menuCode: initialMenuCode, label: initialLabel },
  ]);
  const [activeMenuCode, setActiveMenuCode] = useState<string>(initialMenuCode);
  // 분할 보기 — 우측 패널에 띄울 탭 (null이면 분할 비활성)
  const [splitMenuCode, setSplitMenuCode] = useState<string | null>(null);

  const openTab = useCallback(
    (menuCode: string, label: string): boolean => {
      const exists = tabs.find((t) => t.menuCode === menuCode);
      if (exists) {
        setActiveMenuCode(menuCode);
        return true;
      }
      if (tabs.length >= maxTabs) return false; // ← maxTabs 사용

      setTabs((prev) => [...prev, { menuCode, label }]);
      setActiveMenuCode(menuCode);
      return true;
    },
    [tabs, maxTabs],
  );

  const closeTab = useCallback(
    (menuCode: string) => {
      if (menuCode === "__WELCOME__") return; //WELCOME 페이지 못닫음

      setTabs((prev) => {
        if (prev.length === 1) return prev;
        const idx = prev.findIndex((t) => t.menuCode === menuCode);
        const next = prev.filter((t) => t.menuCode !== menuCode);

        const closingActive = menuCode === activeMenuCode;
        const closingSplit = menuCode === splitMenuCode;

        // 분할 패널 탭을 닫으면 split만 해제
        if (closingSplit) {
          setTimeout(() => setSplitMenuCode(null), 0);
        }

        if (closingActive) {
          // 분할 중이면 split 탭을 active로 승격
          if (splitMenuCode && splitMenuCode !== menuCode) {
            const newActive = splitMenuCode;
            setTimeout(() => {
              setActiveMenuCode(newActive);
              setSplitMenuCode(null);
            }, 0);
          } else {
            const nextActive =
              next[Math.max(0, Math.min(idx - 1, next.length - 1))];
            setTimeout(() => setActiveMenuCode(nextActive.menuCode), 0);
          }
        }
        return next;
      });
    },
    [activeMenuCode, splitMenuCode],
  );

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabs((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  // ── 분할 보기 액션 ────────────────────────────────────────────
  const splitWith = useCallback(
    (menuCode: string) => {
      if (!menuCode) return;
      if (menuCode === activeMenuCode) return; // 같은 탭과는 분할 불가
      if (!tabs.find((t) => t.menuCode === menuCode)) return;
      setSplitMenuCode(menuCode);
    },
    [activeMenuCode, tabs],
  );

  const clearSplit = useCallback(() => {
    setSplitMenuCode(null);
  }, []);

  // 좌/우 패널 스왑 (분할탭을 활성으로, 활성을 분할로)
  const swapPanes = useCallback(() => {
    if (!splitMenuCode) return;
    setActiveMenuCode(splitMenuCode);
    setSplitMenuCode(activeMenuCode);
  }, [activeMenuCode, splitMenuCode]);

  return {
    tabs,
    activeMenuCode,
    splitMenuCode,
    openTab,
    closeTab,
    setActiveMenuCode,
    reorderTabs,
    splitWith,
    clearSplit,
    swapPanes,
  };
}
