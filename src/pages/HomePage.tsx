"use client";

import { useState, useMemo, Children } from "react";
import { ThemeProvider } from "@/app/context/ThemeContext";
import { PopupProvider } from "@/app/components/ui/popup/PopupContext";
import { Sidebar } from "@/app/components/Sidebar";
import { MENU_SECTIONS } from "@/app/menu/menuConfig";
import TenderReceiveDispatch from "@/views/tender/TenderReceiveDispatch";

const MENU_COMPONENT_MAP: Record<string, any> = {
  TENDER_RECEIVE: TenderReceiveDispatch,
};

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentMenuCode, setCurrentMenuCode] = useState<string | null>(
    "TENDER_RECEIVE",
  );

  const ActiveComponent = currentMenuCode
    ? MENU_COMPONENT_MAP[currentMenuCode]
    : null;

  const currentMenuLabel = useMemo(() => {
    return MENU_SECTIONS.flatMap((s) => s.items).find(
      (i) => i.menuCode === currentMenuCode,
    )?.label;
  }, [currentMenuCode]);

  return (
    <ThemeProvider>
      <PopupProvider>
        <div className="h-screen flex">
          <Sidebar
            isOpen={sidebarOpen}
            activeMenuCode={currentMenuCode}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            onSelectMenu={setCurrentMenuCode}
          />

          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b px-6 flex items-center font-semibold">
              {currentMenuLabel ?? "메뉴 선택"}
            </header>

            <main className="flex-1 overflow-hidden p-6">
              {ActiveComponent ? (
                <ActiveComponent />
              ) : (
                <div className="text-gray-400">아직 화면이 없습니다.</div>
              )}
            </main>
          </div>
        </div>
      </PopupProvider>
    </ThemeProvider>
  );
}
