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
        if (menuCode === activeMenuCode) {
          // 남은 탭 중 가장 가까운 탭으로 이동
          // next 가 __WELCOME__ 하나뿐이어도 정상 동작
          const nextActive =
            next[Math.max(0, Math.min(idx - 1, next.length - 1))];
          // setTimeout 으로 state 업데이트 순서 보장
          setTimeout(() => setActiveMenuCode(nextActive.menuCode), 0);
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
