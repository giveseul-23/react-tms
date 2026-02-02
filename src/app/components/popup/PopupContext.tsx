"use client";

import { createContext, useContext, useState } from "react";
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
  const [popup, setPopup] = useState<PopupState>({
    open: false,
    content: null,
    width: "xl", // 기본값 명시 (중요)
  });

  const openPopup = ({ title, content, width }: OpenPopupPayload) => {
    setPopup({
      open: true,
      title,
      content,
      width, // ✅ 이제 정상 전달
    });
  };

  const closePopup = () => {
    setPopup((prev) => ({
      ...prev,
      open: false,
      content: null,
    }));
  };

  return (
    <PopupContext.Provider value={{ openPopup, closePopup }}>
      {children}

      {/* ===== Global Popup Shell ===== */}
      <PopupShell
        open={popup.open}
        onOpenChange={(v) => !v && closePopup()}
        title={popup.title}
        width={popup.width}
      >
        {popup.content}
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
