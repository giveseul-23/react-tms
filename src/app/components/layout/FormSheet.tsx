// src/app/components/layout/FormSheet.tsx
//
// 그리드 옆/위에 폼을 표시하는 컨테이너.
// VehicleMgmt 의 우측 슬라이드 상세패널 / 신규등록 Sheet 를 추출.
//
// mode:
//   - "side"  : 그리드와 같은 영역에 우측 고정 슬라이드 (DOM 위치 고정)
//   - "sheet" : Sheet 컴포넌트 사용 (우측에서 슬라이드 인)
//
// VehicleMgmt 마이그레이션 시 기존 className을 보존하므로 시각 변화 없음.

"use client";

import { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { Sheet, SheetContent } from "@/app/components/ui/sheet";

// ───────────────────────────────────────────────────────────────────────────
// 1) FormSidePanel — 그리드 우측 고정 슬라이드 (VehicleMgmt 상세패널 패턴)
// ───────────────────────────────────────────────────────────────────────────

export interface FormNavProps {
  current: number; // 1-based 표시용 (내부에선 0-based + 1 처리됨)
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onJump?: (oneBased: number) => void;
  navigating?: boolean;
}

export interface FormSidePanelProps {
  open: boolean;
  width?: number;
  badgeLabel?: string; // 예: "수정"
  badgeClassName?: string;
  title?: ReactNode;
  /** 헤더 우측 액션 (삭제 버튼 등) */
  headerActions?: ReactNode;
  onClose: () => void;
  /** 네비게이션 (있으면 헤더 아래 줄에 표시) */
  nav?: FormNavProps;
  /** 입력 상태 (jumpInput 외부 제어용) */
  jumpInput?: string;
  onJumpInputChange?: (v: string) => void;
  onJumpInputBlur?: () => void;
  /** 본문 (폼) */
  children: ReactNode;
  /** 하단 버튼들 */
  footer?: ReactNode;
}

export function FormSidePanel({
  open,
  width = 390,
  badgeLabel,
  badgeClassName,
  title,
  headerActions,
  onClose,
  nav,
  jumpInput,
  onJumpInputChange,
  onJumpInputBlur,
  children,
  footer,
}: FormSidePanelProps) {
  if (!open) return null;

  return (
    <div
      className="shrink-0 border-l border-border bg-background flex flex-col overflow-hidden"
      style={{
        width,
        transition: "width 0.25s ease",
      }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          {badgeLabel && (
            <span
              className={
                badgeClassName ??
                "text-[11px] font-medium px-2.5 py-0.5 rounded-[10px] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
              }
            >
              {badgeLabel}
            </span>
          )}
          {title && <span className="text-[13px] font-medium">{title}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          {headerActions}
          <button
            onClick={onClose}
            className="w-[26px] h-[26px] border border-input rounded-md bg-background flex items-center justify-center text-muted-foreground hover:bg-accent"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 네비게이션 */}
      {nav && (
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-border shrink-0">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={jumpInput ?? ""}
              onChange={(e) =>
                onJumpInputChange?.(e.target.value.replace(/\D/g, ""))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const num = Number(jumpInput);
                  if (num >= 1 && num <= nav.total) {
                    nav.onJump?.(num);
                  } else {
                    onJumpInputBlur?.();
                  }
                }
              }}
              onBlur={onJumpInputBlur}
              disabled={nav.navigating}
              className="w-10 h-[22px] text-xs text-center border border-input rounded bg-background focus:outline-none focus:ring-1 focus:ring-[rgb(var(--primary))]"
            />
            <span className="text-xs text-muted-foreground">/ {nav.total}</span>
            {nav.navigating && (
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
            )}
          </div>
          <div className="flex gap-1">
            <button
              disabled={nav.current <= 1 || nav.navigating}
              onClick={nav.onPrev}
              className="w-[26px] h-[26px] border border-input rounded-md bg-background flex items-center justify-center text-muted-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={nav.current >= nav.total || nav.navigating}
              onClick={nav.onNext}
              className="w-[26px] h-[26px] border border-input rounded-md bg-background flex items-center justify-center text-muted-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto p-3.5">{children}</div>

      {/* 푸터 */}
      {footer && (
        <div className="flex gap-2 px-3.5 py-2.5 border-t border-border shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// 2) FormSheetOverlay — Sheet 컴포넌트 기반 우측 슬라이드 (VehicleMgmt 신규등록 패턴)
// ───────────────────────────────────────────────────────────────────────────

export interface FormSheetOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** SheetContent에 적용할 className. 폭을 바꾸려면 여기서 지정 (예: "w-[520px] sm:max-w-[520px] p-0 gap-0 flex flex-col") */
  contentClassName?: string;
  badgeLabel?: string;
  badgeClassName?: string;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function FormSheetOverlay({
  open,
  onOpenChange,
  contentClassName = "w-[520px] sm:max-w-[520px] p-0 gap-0 flex flex-col",
  badgeLabel,
  badgeClassName,
  title,
  children,
  footer,
}: FormSheetOverlayProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={contentClassName}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            {badgeLabel && (
              <span
                className={
                  badgeClassName ??
                  "text-[11px] font-medium px-2.5 py-0.5 rounded-[10px] bg-emerald-100 text-emerald-700"
                }
              >
                {badgeLabel}
              </span>
            )}
            {title && <span className="text-sm font-medium">{title}</span>}
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {/* 푸터 */}
        {footer && (
          <div className="flex gap-2 px-4 py-3 border-t border-border shrink-0">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
