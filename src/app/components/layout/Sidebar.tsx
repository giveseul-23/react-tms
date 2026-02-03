import {
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Truck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePopup } from "@/app/components/popup/PopupContext";
import { MENU_SECTIONS, MenuSection } from "@/app/menu/menuConfig";

import { SettingsPopup } from "@/views/settings/SettingsPopup";

interface SidebarProps {
  isOpen: boolean;
  activeMenuCode: string | null;
  onToggle: () => void;
  onSelectMenu: (menuCode: string) => void;
}

function findSectionByMenuCode(menuCode: string | null) {
  if (!menuCode) return null;

  for (const section of MENU_SECTIONS) {
    if (section.items.some((item) => item.menuCode === menuCode)) {
      return section.sectionCode;
    }
  }
  return null;
}

export function Sidebar({
  isOpen,
  activeMenuCode,
  onToggle,
  onSelectMenu,
}: SidebarProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(() =>
    findSectionByMenuCode(activeMenuCode),
  );

  useEffect(() => {
    const sectionCode = findSectionByMenuCode(activeMenuCode);
    if (sectionCode) {
      setExpandedSection(sectionCode);
    }
  }, [activeMenuCode]);

  const { openPopup } = usePopup();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-30
          w-72 bg-[rgb(var(--bg))] border-r border-gray-200
          transform transition-transform duration-300
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-r-0"
          }
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b">
          {/* left: logo + title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[rgb(var(--primary))] rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">Mobyus TMS</span>
          </div>

          {/* right: toggle button */}
          <button
            onClick={onToggle}
            className="hidden lg:block p-1 hover:bg-gray-100 hover:text-[rgb(var(--hover))] rounded"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          {MENU_SECTIONS.map((section: MenuSection) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === section.sectionCode;

            return (
              <div key={section.sectionCode} className="mb-2">
                <button
                  onClick={() =>
                    setExpandedSection(isExpanded ? null : section.sectionCode)
                  }
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-[rgb(var(--hover))] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{section.title}</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {section.items.map((item) => (
                      <button
                        key={item.menuCode}
                        onClick={() => onSelectMenu(item.menuCode)}
                        className={`
                          w-full text-left px-3 py-2 text-sm rounded-lg
                          ${
                            activeMenuCode === item.menuCode
                              ? "bg-[var(--grid-header-bg)] text-[rgb(var(--primary))] font-medium"
                              : "text-[rgb(var(--fg))] hover:bg-gray-100 hover:text-[rgb(var(--hover))]"
                          }
                        `}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">주다슬</p>
              <p className="text-xs text-gray-500 truncate">010-9523-5068</p>
            </div>
            <button
              className="p-1 bg-[rgb(var(--bg))] hover:bg-gray-300 hover:text-black rounded"
              onClick={() =>
                openPopup({
                  title: "사용자 환경설정",
                  content: <SettingsPopup />,
                  width: "xl",
                })
              }
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Collapsed Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="hidden lg:block fixed left-0 top-20 z-10 p-2 bg-[rgb(var(--bg))] btn-outline rounded-r-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
