"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
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

  const ctxValue = useMemo(() => ({ openPopup, closePopup }), [openPopup, closePopup]);

  return (
    <PopupContext.Provider value={ctxValue}>
      {children}

      {/*
        스택의 모든 popup 을 React 트리에 유지 (각자 PopupShell 로 감싸서 렌더).
        active = 최상단 여부 — 비활성 popup 은 hidden 으로 마운트만 유지해
        중첩 popup 에서 하위 popup 의 form state 가 unmount 로 날아가지 않게 함.
      */}
      {stack.map((p, i) => {
        const isTop = i === stack.length - 1;
        return (
          <PopupShell
            key={i}
            open={p.open}
            active={isTop}
            onOpenChange={(v) => !v && closePopup()}
            title={p.title}
            width={p.width}
          >
            {p.content}
          </PopupShell>
        );
      })}
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
