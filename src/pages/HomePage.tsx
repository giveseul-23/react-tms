// src/pages/HomePage.tsx
"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { PageTabBar } from "@/app/components/layout/PageTabBar";
import { MENU_COMPONENT_MAP } from "@/app/menu/menuComponentMap";
import { usePageTabs } from "@/hooks/usePageTabs";
import { SearchToast } from "@/app/components/ui/SearchToast";
import { useDynamicMenu } from "@/hooks/useDynamicMenu";
import { usePopup } from "@/app/components/popup/PopupContext";
import ConfirmModal from "@/views/common/ConfirmPopup";

const STATIC_LABEL_MAP: Record<string, string> = {
  __WELCOME__: "Home",
  TENDER_RECEIVE: "운송사요청목록",
  SEARCH_CONDITION: "조회조건",
  MENU_CONFIG: "메뉴구성",
};

export default function HomePage() {
  const { openPopup, closePopup } = usePopup();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { sections, menuLabelMap, loading: menuLoading } = useDynamicMenu();

  const mergedLabelMap = useMemo(
    () => ({ ...STATIC_LABEL_MAP, ...menuLabelMap }),
    [menuLabelMap],
  );

  const {
    tabs,
    activeMenuCode,
    openTab,
    closeTab,
    setActiveMenuCode,
    reorderTabs,
  } = usePageTabs(
    "MENU_PLAN_TENDER_RECEIVE", // 기본 탭: 홈(Welcome)
    mergedLabelMap["MENU_PLAN_TENDER_RECEIVE"] ?? "Home",
    20,
  );

  function handleSelectMenu(menuCode: string) {
    const label = mergedLabelMap[menuCode] ?? menuCode;
    const success = openTab(menuCode, label);

    if (!success) {
      openPopup({
        title: "",
        width: "sm",
        content: (
          <ConfirmModal
            type="check"
            title="탭 제한 초과"
            description={`탭은 최대 ${20}개까지 열 수 있습니다.`}
            onClose={closePopup}
          />
        ),
      });
    }
  }

  const mountedMenuCodes = useMemo(() => tabs.map((t) => t.menuCode), [tabs]);

  return (
    <div className="h-screen flex">
      <SearchToast />

      <Sidebar
        isOpen={sidebarOpen}
        sections={menuLoading ? [] : sections}
        activeMenuCode={activeMenuCode}
        onToggle={() => setSidebarOpen((o) => !o)}
        onSelectMenu={handleSelectMenu}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <PageTabBar
          tabs={tabs}
          activeMenuCode={activeMenuCode}
          onSelect={setActiveMenuCode}
          onClose={closeTab}
          onReorder={reorderTabs}
        />

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
                  <div className="text-gray-400 flex items-center justify-center h-full text-sm">
                    아직 화면이 없습니다. ({menuCode})
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
