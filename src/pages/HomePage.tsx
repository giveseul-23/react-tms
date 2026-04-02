"use client";

import { useState, useMemo } from "react";

import { Sidebar } from "@/app/components/layout/Sidebar";
import { PageTabBar } from "@/app/components/layout/PageTabBar";
import { MENU_SECTIONS } from "@/app/menu/menuConfig";
import { MENU_COMPONENT_MAP } from "@/app/menu/menuComponentMap";
import { usePageTabs } from "@/hooks/usePageTabs";
import { SearchToast } from "@/app/components/ui/SearchToast";

/** 메뉴코드 → 라벨 빠른 조회 */
const MENU_LABEL_MAP: Record<string, string> = Object.fromEntries(
  MENU_SECTIONS.flatMap((s) => s.items.map((i) => [i.menuCode, i.label])),
);

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    tabs,
    activeMenuCode,
    openTab,
    closeTab,
    setActiveMenuCode,
    reorderTabs,
  } = usePageTabs("MENU_CONFIG", MENU_LABEL_MAP["MENU_CONFIG"] ?? "홈");

  function handleSelectMenu(menuCode: string) {
    const label = MENU_LABEL_MAP[menuCode] ?? menuCode;
    openTab(menuCode, label);
  }

  const activeLabel = MENU_LABEL_MAP[activeMenuCode] ?? "메뉴 선택";

  /**
   * 열린 탭의 menuCode 목록.
   * 탭을 닫으면 unmount, 열려 있는 탭은 display:none으로 상태를 보존합니다.
   */
  const mountedMenuCodes = useMemo(() => tabs.map((t) => t.menuCode), [tabs]);

  return (
    <div className="h-screen flex">
      <SearchToast />
      <Sidebar
        isOpen={sidebarOpen}
        activeMenuCode={activeMenuCode}
        onToggle={() => setSidebarOpen((o) => !o)}
        onSelectMenu={handleSelectMenu}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* 북마크 탭 바 — 가장 위 */}
        <PageTabBar
          tabs={tabs}
          activeMenuCode={activeMenuCode}
          onSelect={setActiveMenuCode}
          onClose={closeTab}
          onReorder={reorderTabs}
        />

        {/* 상단 헤더 — 탭 바 아래 */}
        {/* <header className="h-12 border-b px-6 flex items-center font-semibold shrink-0">
          {activeLabel}
        </header> */}

        {/* 컨텐츠: 열린 탭을 모두 mount 상태로 유지, 비활성은 display:none */}
        <main className="flex-1 min-h-0 p-6 relative">
          {mountedMenuCodes.map((menuCode) => {
            const Component = (
              MENU_COMPONENT_MAP as Record<string, React.ComponentType>
            )[menuCode];
            const isActive = menuCode === activeMenuCode;

            return (
              <div
                key={menuCode}
                className="absolute inset-6"
                style={{
                  display: isActive ? "flex" : "none",
                  flexDirection: "column",
                }}
              >
                {Component ? (
                  <Component />
                ) : (
                  <div className="text-gray-400 flex items-center justify-center h-full">
                    아직 화면이 없습니다.
                  </div>
                )}
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
}
