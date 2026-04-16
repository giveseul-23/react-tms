// src/pages/HomePage.tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { PageTabBar } from "@/app/components/layout/PageTabBar";
import {
  resolveMenuComponent,
  prefetchAllMenuComponents,
} from "@/app/config/menuComponentRegistry";
import { Skeleton } from "@/app/components/ui/skeleton";
import { usePageTabs } from "@/hooks/usePageTabs";
import { SearchToast } from "@/app/components/ui/SearchToast";
import { useDynamicMenu } from "@/hooks/useDynamicMenu";
import { usePopup } from "@/app/components/popup/PopupContext";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";

const STATIC_LABEL_MAP: Record<string, string> = {
  __WELCOME__: "Home",
  TENDER_RECEIVE: "운송사요청목록",
  SEARCH_CONDITION: "조회조건",
  MENU_CONFIG: "메뉴구성",
};

export default function HomePage() {
  const { openPopup, closePopup } = usePopup();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 로그인 후(=HomePage 마운트 시) 모든 화면 chunk 를 백그라운드로 미리 다운로드.
  // 메뉴 클릭 시점에 chunk 가 이미 캐시되어 있어 첫 진입 지연 / 폰트 플리커가 사라짐.
  // 초기 paint 를 막지 않도록 다음 tick 으로 미룸.
  useEffect(() => {
    const id = window.setTimeout(() => {
      prefetchAllMenuComponents();
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const {
    sections,
    menuLabelMap,
    menuUrlMap,
    loading: menuLoading,
  } = useDynamicMenu();

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
    "__WELCOME__", // 기본 탭: 홈(Welcome)
    mergedLabelMap["__WELCOME__"] ?? "Home",
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

        <main className="flex-1 min-h-0 px-[15px] pt-[15px] pb-0 relative overflow-hidden">
          <SearchToast />
          {mountedMenuCodes.map((menuCode) => {
            const Component = resolveMenuComponent(
              menuCode,
              menuUrlMap[menuCode],
            );
            const isActive = menuCode === activeMenuCode;

            return (
              <div
                key={menuCode}
                className="absolute left-[15px] right-[15px] top-[15px] bottom-[15px] overflow-hidden"
                style={{
                  display: isActive ? "flex" : "none",
                  flexDirection: "column",
                }}
              >
                {Component ? (
                  <Suspense fallback={<Skeleton className="h-full w-full" />}>
                    <Component />
                  </Suspense>
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
