"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { PopupShell } from "./PopupShell";
import type { PopupWidth } from "./popup.types";

type PopupState = {
  open: boolean;
  title?: string;
  content: React.ReactNode | null;
  width?: PopupWidth;
};

type OpenPopupPayload = Omit<PopupState, "open">;

type PopupContextType = {
  openPopup: (payload: OpenPopupPayload) => void;
  closePopup: () => void;
};

const PopupContext = createContext<PopupContextType | null>(null);

export function PopupProvider({ children }: { children: React.ReactNode }) {
  // 팝업 스택으로 변경 → 중첩 팝업 지원
  const [stack, setStack] = useState<PopupState[]>([]);

  const openPopup = useCallback(({ title, content, width }: OpenPopupPayload) => {
    setStack((prev) => [...prev, { open: true, title, content, width }]);
  }, []);

  const closePopup = useCallback(() => {
    setStack((prev) => prev.slice(0, -1));
  }, []);

  const top = stack[stack.length - 1];

  return (
    <PopupContext.Provider value={{ openPopup, closePopup }}>
      {children}

      {/* 스택의 최상단 팝업만 렌더링 */}
      <PopupShell
        open={!!top?.open}
        onOpenChange={(v) => !v && closePopup()}
        title={top?.title}
        width={top?.width}
      >
        {top?.content ?? null}
      </PopupShell>
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const ctx = useContext(PopupContext);
  if (!ctx) {
    throw new Error("usePopup must be used within PopupProvider");
  }
  return ctx;
}
