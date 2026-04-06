// src/hooks/usePageTabs.ts
import { useState, useCallback } from "react";

export type PageTab = {
  menuCode: string;
  label: string;
};

export function usePageTabs(initialMenuCode: string, initialLabel: string) {
  const [tabs, setTabs] = useState<PageTab[]>([
    { menuCode: initialMenuCode, label: initialLabel },
  ]);
  const [activeMenuCode, setActiveMenuCode] = useState<string>(initialMenuCode);

  const openTab = useCallback((menuCode: string, label: string) => {
    setTabs((prev) => {
      const exists = prev.find((t) => t.menuCode === menuCode);
      if (exists) return prev;
      return [...prev, { menuCode, label }];
    });
    setActiveMenuCode(menuCode);
  }, []);

  const closeTab = useCallback(
    (menuCode: string) => {
      if (menuCode === "__WELCOME__") return; //WELCOME 페이지 못닫음

      setTabs((prev) => {
        if (prev.length === 1) return prev;
        const idx = prev.findIndex((t) => t.menuCode === menuCode);
        const next = prev.filter((t) => t.menuCode !== menuCode);
        if (menuCode === activeMenuCode) {
          const nextActive = next[Math.min(idx, next.length - 1)];
          setActiveMenuCode(nextActive.menuCode);
        }
        return next;
      });
    },
    [activeMenuCode],
  );

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabs((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  return {
    tabs,
    activeMenuCode,
    openTab,
    closeTab,
    setActiveMenuCode,
    reorderTabs,
  };
}
