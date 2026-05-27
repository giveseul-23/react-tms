// src/pages/HomePage.tsx
"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
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
    refetch: refetchMenu,
  } = useDynamicMenu();

  const mergedLabelMap = useMemo(
    () => ({ ...STATIC_LABEL_MAP, ...menuLabelMap }),
    [menuLabelMap],
  );

  const {
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

  // 탭바 클릭 시 — 분할탭을 클릭하면 좌/우 패널 스왑
  const handleSelectTab = useCallback(
    (menuCode: string) => {
      if (menuCode === activeMenuCode) return;
      if (menuCode === splitMenuCode) {
        swapPanes();
        return;
      }
      setActiveMenuCode(menuCode);
    },
    [activeMenuCode, splitMenuCode, setActiveMenuCode, swapPanes],
  );

  const mountedMenuCodes = useMemo(() => tabs.map((t) => t.menuCode), [tabs]);

  // ── 분할 비율 / 드래그 디바이더 ─────────────────────────────────
  const [splitRatio, setSplitRatio] = useState(0.5);
  const mainRef = useRef<HTMLElement | null>(null);

  const startDividerDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const onMouseMove = (ev: MouseEvent) => {
      if (!mainRef.current) return;
      const rect = mainRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const x = ev.clientX - rect.left;
      const ratio = Math.min(Math.max(x / rect.width, 0.2), 0.8);
      setSplitRatio(ratio);
    };
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // ── 드래그 앤 드롭으로 분할 ─────────────────────────────────────
  // PageTabBar가 dragstart에서 알려주는 menuCode를 그대로 사용 (dataTransfer 의존 X)
  const [draggingTab, setDraggingTab] = useState<string | null>(null);
  const [splitDropHint, setSplitDropHint] = useState(false);

  const handleMainDragOver = (e: React.DragEvent) => {
    if (!draggingTab) return;
    if (!mainRef.current) return;
    const rect = mainRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x > rect.width * 0.5) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (!splitDropHint) setSplitDropHint(true);
    } else if (splitDropHint) {
      setSplitDropHint(false);
    }
  };

  const handleMainDragLeave = (e: React.DragEvent) => {
    if (
      e.currentTarget instanceof Node &&
      e.relatedTarget instanceof Node &&
      (e.currentTarget as Node).contains(e.relatedTarget as Node)
    )
      return;
    setSplitDropHint(false);
  };

  const handleMainDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setSplitDropHint(false);
    if (!draggingTab || !mainRef.current) return;
    const rect = mainRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x > rect.width * 0.5) {
      splitWith(draggingTab);
    }
  };

  const handleTabDragEnd = useCallback(() => {
    setDraggingTab(null);
    setSplitDropHint(false);
  }, []);

  return (
    <div className="h-screen flex">
      <Sidebar
        isOpen={sidebarOpen}
        sections={menuLoading ? [] : sections}
        activeMenuCode={activeMenuCode}
        onToggle={() => setSidebarOpen((o) => !o)}
        onSelectMenu={handleSelectMenu}
        onRefresh={refetchMenu}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <PageTabBar
          tabs={tabs}
          activeMenuCode={activeMenuCode}
          splitMenuCode={splitMenuCode}
          onSelect={handleSelectTab}
          onClose={closeTab}
          onReorder={reorderTabs}
          onDragStartTab={setDraggingTab}
          onDragEndTab={handleTabDragEnd}
        />

        <main
          ref={mainRef}
          className="flex-1 min-h-0 px-[15px] pt-[15px] pb-0 relative overflow-hidden"
          onDragOver={handleMainDragOver}
          onDragLeave={handleMainDragLeave}
          onDrop={handleMainDrop}
        >
          <SearchToast />
          {mountedMenuCodes.map((menuCode) => {
            const Component = resolveMenuComponent(
              menuCode,
              menuUrlMap[menuCode],
            );
            const isActive = menuCode === activeMenuCode;
            const isSplit = menuCode === splitMenuCode;
            const visible = isActive || isSplit;

            // 분할 모드에서만 left/right를 인라인으로 override (단일 모드는 기존과 동일)
            const splitOverride: React.CSSProperties = {};
            if (splitMenuCode) {
              if (isActive) {
                splitOverride.right = `calc(${(1 - splitRatio) * 100}% + 2px)`;
              } else if (isSplit) {
                splitOverride.left = `calc(${splitRatio * 100}% + 2px)`;
              }
            }

            return (
              <div
                key={menuCode}
                className="absolute left-[15px] right-[15px] top-[15px] bottom-[15px] overflow-hidden"
                style={{
                  display: visible ? "flex" : "none",
                  flexDirection: "column",
                  ...splitOverride,
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

          {/* 분할 디바이더 + 분할 해제 버튼 */}
          {splitMenuCode && (
            <>
              <div
                className="absolute top-[15px] bottom-[15px] w-1 -ml-0.5 bg-gray-200 hover:bg-gray-400 cursor-col-resize z-10"
                style={{ left: `${splitRatio * 100}%` }}
                onMouseDown={startDividerDrag}
              />
              <button
                type="button"
                className="absolute z-20 w-6 h-6 rounded-full bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center shadow-sm"
                style={{
                  top: 2,
                  left: `calc(${splitRatio * 100}% - 12px)`,
                }}
                onClick={clearSplit}
                title="분할 해제"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          )}

          {/* 드롭 인디케이터 — 우측 절반 */}
          {splitDropHint && (
            <div
              className="absolute top-[15px] bottom-[15px] right-[15px] bg-blue-200/30 border-2 border-dashed border-blue-400 rounded pointer-events-none z-20"
              style={{ left: "50%" }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
