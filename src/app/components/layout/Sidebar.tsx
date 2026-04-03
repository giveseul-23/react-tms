import {
  Settings,
  ChevronLeft,
  ChevronRight,
  Truck,
  LogOut,
  BookOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePopup } from "@/app/components/popup/PopupContext";
import { MENU_SECTIONS, MenuSection } from "@/app/menu/menuConfig";
import { SettingsPopup } from "@/views/settings/SettingsPopup";
import {
  getUserName,
  getUserGroup,
  clearTokens,
} from "@/app/services/auth/auth";

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
    if (sectionCode) setExpandedSection(sectionCode);
  }, [activeMenuCode]);

  const { openPopup } = usePopup();
  const navigate = useNavigate();

  function logOut() {
    clearTokens();
    navigate("/login", { replace: true });
  }

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
          bg-[rgb(var(--bg))] border-r border-gray-200
          transform transition-all duration-300 flex flex-col
          ${
            isOpen
              ? "w-60 translate-x-0"
              : "-translate-x-full lg:translate-x-0 lg:w-14 lg:overflow-hidden"
          }
        `}
      >
        {/* Logo */}
        <div
          className={`h-16 flex items-center justify-between border-b ${isOpen ? "px-6" : "px-0"}`}
        >
          {isOpen ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[rgb(var(--primary))] rounded-lg flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg whitespace-nowrap">
                  Mobyus TMS
                </span>
              </div>
              <button
                onClick={onToggle}
                className="hidden lg:block p-1 hover:bg-gray-100 hover:text-[rgb(var(--hover))] rounded"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={onToggle}
              className="hidden lg:flex w-full h-full items-center justify-center hover:bg-gray-100 hover:text-[rgb(var(--hover))]"
            >
              <div className="w-8 h-8 bg-[rgb(var(--primary))] rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
            </button>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          {MENU_SECTIONS.map((section: MenuSection) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === section.sectionCode;
            const isActive = section.items.some(
              (item) => item.menuCode === activeMenuCode,
            );

            return (
              <div key={section.sectionCode} className="mb-2">
                <button
                  onClick={() => {
                    if (!isOpen) onToggle();
                    setExpandedSection(isExpanded ? null : section.sectionCode);
                  }}
                  title={!isOpen ? section.title : undefined}
                  className={`
                    w-full flex items-center px-3 py-1 text-sm font-medium
                    hover:bg-gray-100 hover:text-[rgb(var(--hover))] rounded-lg
                    ${isOpen ? "justify-between" : "justify-center"}
                    ${isActive && !isOpen ? "text-[rgb(var(--primary))]" : ""}
                  `}
                >
                  <div className={`flex items-center ${isOpen ? "gap-3" : ""}`}>
                    <Icon className="w-5 h-5 shrink-0" />
                    {isOpen && <span>{section.title}</span>}
                  </div>
                  {isOpen && (
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  )}
                </button>

                {isOpen && isExpanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {section.items.map((item) => (
                      <button
                        key={item.menuCode}
                        onClick={() => onSelectMenu(item.menuCode)}
                        className={`
                          w-full text-left px-3 py-1 text-sm rounded-lg
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
          {isOpen ? (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{getUserName()}</p>
                <p className="text-xs text-gray-500 truncate">
                  {getUserGroup()}
                </p>
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
              <button
                className="p-1 bg-[rgb(var(--bg))] hover:bg-gray-300 hover:text-black rounded"
                onClick={logOut}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <button
                title="환경설정"
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
              <button
                title="로그아웃"
                className="p-1 bg-[rgb(var(--bg))] hover:bg-gray-300 hover:text-black rounded"
                onClick={logOut}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <div className="p-2 border-t">
          <button
            onClick={() => window.open("/guide.html", "_blank")}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors w-full"
          >
            <BookOpen className="w-4 h-4" />
            <span>화면 제작 가이드</span>
          </button>
        </div>
      </aside>
    </>
  );
}
