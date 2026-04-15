// src/app/components/layout/Sidebar.tsx
import {
  Settings,
  ChevronLeft,
  ChevronRight,
  Truck,
  LogOut,
  BookOpen,
  Search,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePopup } from "@/app/components/popup/PopupContext";
import type { MenuSection, MenuNode } from "@/app/config/menuConfig";
import { SettingsPopup } from "@/app/components/popup/SettingsPopup";
import {
  getUserName,
  getUserGroup,
  clearTokens,
} from "@/app/services/auth/auth";

import logo from "@/assets/gs_logo.png";

interface SidebarProps {
  isOpen: boolean;
  activeMenuCode: string | null;
  onToggle: () => void;
  onSelectMenu: (menuCode: string) => void;
  sections?: MenuSection[];
}

// ── 유틸 ──────────────────────────────────────────────────────────────────────

function findActiveSectionCodes(
  menuCode: string | null,
  sections: MenuSection[],
): string[] {
  if (!menuCode) return [];
  return sections
    .filter((sec) => sec.items.some((i) => i.menuCode === menuCode))
    .map((sec) => sec.sectionCode);
}

function nodeContains(node: MenuNode, menuCode: string): boolean {
  if (node.type === "item") return node.menuCode === menuCode;
  return node.children.some((c) => nodeContains(c, menuCode));
}

function collectGroupCodes(nodes: MenuNode[]): string[] {
  const codes: string[] = [];
  nodes.forEach((n) => {
    if (n.type === "group") {
      codes.push(n.code);
      codes.push(...collectGroupCodes(n.children));
    }
  });
  return codes;
}

function filterNodes(nodes: MenuNode[], q: string): MenuNode[] {
  if (!q) return nodes;
  const lower = q.toLowerCase();
  const result: MenuNode[] = [];
  nodes.forEach((n) => {
    if (n.type === "item") {
      if (
        n.label.toLowerCase().includes(lower) ||
        n.menuCode.toLowerCase().includes(lower)
      )
        result.push(n);
    } else {
      const filtered = filterNodes(n.children, q);
      if (filtered.length > 0) result.push({ ...n, children: filtered });
    }
  });
  return result;
}

// ── 재귀 노드 렌더러 ──────────────────────────────────────────────────────────

function MenuNodeRenderer({
  node,
  depth,
  activeMenuCode,
  onSelectMenu,
  expandedGroups,
  onToggleGroup,
}: {
  node: MenuNode;
  depth: number;
  activeMenuCode: string | null;
  onSelectMenu: (code: string) => void;
  expandedGroups: Set<string>;
  onToggleGroup: (code: string) => void;
}) {
  if (node.type === "item") {
    const isActive = node.menuCode === activeMenuCode;
    return (
      <button
        data-menu-code={node.menuCode}
        onClick={() => onSelectMenu(node.menuCode)}
        style={{ paddingLeft: `${16 + depth * 16}px` }}
        className={`
          w-full text-left py-1 pr-3 text-[13px] rounded-lg transition-colors
          ${
            isActive
              ? "bg-[var(--grid-header-bg)] text-[rgb(var(--primary))] font-medium"
              : "text-[rgb(var(--fg))] hover:bg-gray-100 hover:text-[rgb(var(--hover))]"
          }
        `}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-0.5 h-3 bg-slate-200 rounded-full shrink-0" />
          <span>{node.label}</span>
        </div>
      </button>
    );
  }

  const isOpen = expandedGroups.has(node.code);
  return (
    <div>
      <button
        onClick={() => onToggleGroup(node.code)}
        style={{ paddingLeft: `${16 + depth * 16}px` }}
        className="w-full flex items-center justify-between py-1 pr-3 text-[13px] text-slate-500 font-medium hover:bg-gray-100 hover:text-[rgb(var(--hover))] rounded-lg transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <div className="w-0.5 h-3 bg-slate-300 rounded-full shrink-0" />
          <span>{node.label}</span>
        </div>
        <ChevronRight
          className={`w-3.5 h-3.5 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
      </button>
      {isOpen && (
        <div>
          {node.children.map((child, i) => (
            <MenuNodeRenderer
              key={child.type === "item" ? child.menuCode : child.code + i}
              node={child}
              depth={depth + 1}
              activeMenuCode={activeMenuCode}
              onSelectMenu={onSelectMenu}
              expandedGroups={expandedGroups}
              onToggleGroup={onToggleGroup}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar({
  isOpen,
  activeMenuCode,
  onToggle,
  onSelectMenu,
  sections: sectionsProp,
}: SidebarProps) {
  const sections: MenuSection[] = sectionsProp ?? [];

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set([...findActiveSectionCodes(activeMenuCode, sections), "TMS"]),
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // nav 스크롤용 ref
  const navRef = useRef<HTMLDivElement>(null);

  const { openPopup } = usePopup();
  const navigate = useNavigate();

  // activeMenuCode 변경 시 해당 섹션/그룹 자동 펼침 + 스크롤
  useEffect(() => {
    const codes = findActiveSectionCodes(activeMenuCode, sections);
    if (codes.length > 0) {
      setExpandedSections((prev) => new Set([...prev, ...codes, "TMS"]));
    }
    if (activeMenuCode) {
      const toOpen: string[] = [];
      sections.forEach((sec) => {
        (sec.nodes ?? []).forEach((node) => {
          if (node.type === "group" && nodeContains(node, activeMenuCode)) {
            const walk = (n: MenuNode) => {
              if (n.type === "group") {
                toOpen.push(n.code);
                n.children.forEach(walk);
              }
            };
            walk(node);
          }
        });
      });
      if (toOpen.length > 0)
        setExpandedGroups((prev) => new Set([...prev, ...toOpen]));

      // 활성 메뉴 버튼으로 스크롤 — 펼침 state 반영 후 실행
      setTimeout(() => {
        if (!navRef.current) return;
        const activeEl = navRef.current.querySelector<HTMLElement>(
          `[data-menu-code="${activeMenuCode}"]`,
        );
        if (activeEl) {
          activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }, 100);
    }
  }, [activeMenuCode, sections]);

  // ── 섹션 토글
  const toggleSection = (code: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  // ── 섹션별 펼치기/닫기
  const expandSection = (sec: MenuSection) => {
    setExpandedSections((prev) => new Set([...prev, sec.sectionCode]));
    setExpandedGroups(
      (prev) => new Set([...prev, ...collectGroupCodes(sec.nodes ?? [])]),
    );
  };

  const collapseSection = (sec: MenuSection) => {
    const codes = new Set(collectGroupCodes(sec.nodes ?? []));
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      codes.forEach((c) => next.delete(c));
      return next;
    });
  };

  // ── 전체 펼치기/닫기
  const expandAll = () => {
    setExpandedSections(new Set(sections.map((s) => s.sectionCode)));
    setExpandedGroups(
      new Set(sections.flatMap((s) => collectGroupCodes(s.nodes ?? []))),
    );
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
    setExpandedGroups(new Set());
  };

  // ── 그룹 토글
  const toggleGroup = (code: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  // ── 검색 필터
  const filteredSections = useMemo(() => {
    if (!searchQuery) return sections;
    return sections
      .map((sec) => ({
        ...sec,
        nodes: filterNodes(sec.nodes ?? [], searchQuery),
        items: sec.items.filter(
          (i) =>
            i.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.menuCode.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      }))
      .filter((sec) => (sec.nodes?.length ?? 0) > 0 || sec.items.length > 0);
  }, [sections, searchQuery]);

  const isSearching = searchQuery.length > 0;

  function logOut() {
    clearTokens();
    navigate("/login", { replace: true });
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

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
        {/* ── Logo ── */}
        <div
          className={`h-16 flex items-center justify-between border-b shrink-0 ${isOpen ? "px-6" : "px-0"}`}
        >
          {isOpen ? (
            <>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" /*{bg-[rgb(var(--primary))]}*/
                >
                  {/* <Truck className="w-5 h-5 text-white" /> */}
                  <img
                    src={logo}
                    alt="logo Img"
                    className="h-[20px] w-[20px]"
                  />
                </div>
                <span className="font-semibold text-lg whitespace-nowrap">
                  GS Caltex TMS
                </span>
              </div>
              <button
                onClick={onToggle}
                className="hidden lg:block p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={onToggle}
              className="hidden lg:flex w-full h-full items-center justify-center hover:bg-gray-100"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center" /*{bg-[rgb(var(--primary))]}*/
              >
                {/* <Truck className="w-5 h-5 text-white" /> */}
                <img src={logo} alt="logo Img" className="h-[20px] w-[20px]" />
              </div>
            </button>
          )}
        </div>

        {/* ── 검색 + 전체 펼치기/닫기 ── */}
        {isOpen && (
          <div className="shrink-0 px-3 py-2 border-b">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="메뉴 검색..."
                className="w-full h-7 pl-7 pr-7 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 bg-slate-50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-slate-400">전체</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={expandAll}
                  title="전체 펼치기"
                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={collapseAll}
                  title="전체 닫기"
                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Menu ── */}
        <nav ref={navRef} className="flex-1 overflow-y-auto p-2">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            const isSectionExpanded =
              isSearching || expandedSections.has(section.sectionCode);
            const isActive = section.items.some(
              (i) => i.menuCode === activeMenuCode,
            );
            const nodes = section.nodes;
            const hasNodes = (nodes?.length ?? 0) > 0;

            return (
              <div key={section.sectionCode} className="mb-1">
                {/* 섹션 헤더 */}
                <div className="flex items-center group px-1">
                  {!isOpen && (
                    <button
                      onClick={() => onToggle()}
                      title={section.title}
                      className={`
                        flex items-center justify-center w-full py-1.5 rounded-lg
                        hover:bg-gray-100 hover:text-[rgb(var(--hover))] transition-colors
                        ${isActive ? "text-[rgb(var(--primary))]" : ""}
                      `}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                    </button>
                  )}

                  {isOpen && (
                    <>
                      <button
                        onClick={() => toggleSection(section.sectionCode)}
                        className="flex items-center gap-2 flex-1 py-1.7 pl-2 text-[13px] font-medium hover:bg-gray-100 hover:text-[rgb(var(--hover))] rounded-lg transition-colors min-w-0"
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span className="truncate">{section.title}</span>
                      </button>

                      {hasNodes && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              expandSection(section);
                            }}
                            title={`${section.title} 모두 펼치기`}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              collapseSection(section);
                            }}
                            title={`${section.title} 모두 닫기`}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => toggleSection(section.sectionCode)}
                        className="p-1 shrink-0 hover:bg-gray-100 rounded transition-colors"
                      >
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${isSectionExpanded ? "rotate-90" : ""}`}
                        />
                      </button>
                    </>
                  )}
                </div>

                {/* 섹션 내용 */}
                {isOpen && isSectionExpanded && (
                  <div className="mt-0.5">
                    {hasNodes
                      ? nodes!.map((node, i) => (
                          <MenuNodeRenderer
                            key={
                              node.type === "item"
                                ? node.menuCode
                                : node.code + i
                            }
                            node={node}
                            depth={0}
                            activeMenuCode={activeMenuCode}
                            onSelectMenu={onSelectMenu}
                            expandedGroups={
                              isSearching
                                ? new Set(collectGroupCodes(nodes!))
                                : expandedGroups
                            }
                            onToggleGroup={toggleGroup}
                          />
                        ))
                      : section.items.map((item) => (
                          <button
                            key={item.menuCode}
                            data-menu-code={item.menuCode}
                            onClick={() => onSelectMenu(item.menuCode)}
                            style={{ paddingLeft: "16px" }}
                            className={`
                              w-full text-left py-1 pr-3 text-[13px] rounded-lg
                              ${
                                activeMenuCode === item.menuCode
                                  ? "bg-[var(--grid-header-bg)] text-[rgb(var(--primary))] font-medium"
                                  : "text-[rgb(var(--fg))] hover:bg-gray-100 hover:text-[rgb(var(--hover))]"
                              }
                            `}
                          >
                            <div className="flex items-center gap-1.5">
                              <div className="w-0.5 h-3 bg-slate-200 rounded-full shrink-0" />
                              <span>{item.label}</span>
                            </div>
                          </button>
                        ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div className="p-4 border-t shrink-0">
          {isOpen ? (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{getUserName()}</p>
                <p className="text-xs text-gray-500 truncate">
                  {getUserGroup()}
                </p>
              </div>
              <button
                className="p-1 hover:bg-gray-300 hover:text-black rounded"
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
                className="p-1 hover:bg-gray-300 hover:text-black rounded"
                onClick={logOut}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <button
                title="환경설정"
                className="p-1 hover:bg-gray-300 hover:text-black rounded"
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
                className="p-1 hover:bg-gray-300 hover:text-black rounded"
                onClick={logOut}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="p-2 border-t shrink-0">
          <button
            onClick={() => window.open("/guide.html", "_blank")}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors w-full"
          >
            <BookOpen className="w-4 h-4" />
            {isOpen && <span>화면 제작 가이드</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
