"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { PopupShell } from "./PopupShell";
import type { PopupWidth } from "./popup.types";

type PopupState = {
  open: boolean;
  title?: string;
  content: React.ReactNode | null;
  width?: PopupWidth;
  /** PopupShell 헤더의 기본 라벨 결정 — title 없을 때 "에러"/"확정"/"알림" 등으로 표시. */
  type?: string;
};

type OpenPopupPayload = Omit<PopupState, "open">;

type PopupContextType = {
  openPopup: (payload: OpenPopupPayload) => void;
  closePopup: () => void;
};

const PopupContext = createContext<PopupContextType | null>(null);

// 팝업 열림 여부만 읽는 별도 context — openPopup/closePopup 소비자(컨트롤러 등)가
// 팝업 열림/닫힘마다 재렌더되지 않도록 분리. 외부클릭으로 닫히는 폼(FormSheet)이
// "지금 팝업이 떠 있으니 닫지 마라" 판단에 사용.
const PopupOpenContext = createContext(false);
export function useHasOpenPopup(): boolean {
  return useContext(PopupOpenContext);
}

// 모듈 레벨 imperative 핸들 — React 컴포넌트 밖(예: makeExcelGroupAction 의 onClick)에서
// 모달을 띄울 때 사용. Provider 마운트 동안만 유효. (SearchToast 의 showSearchToast 와 동일 패턴)
let _popupApi: PopupContextType | null = null;
export function getPopupApi(): PopupContextType | null {
  return _popupApi;
}

export function PopupProvider({ children }: { children: React.ReactNode }) {
  // 팝업 스택으로 변경 → 중첩 팝업 지원
  const [stack, setStack] = useState<PopupState[]>([]);

  const openPopup = useCallback(
    ({ title, content, width, type }: OpenPopupPayload) => {
      setStack((prev) => [...prev, { open: true, title, content, width, type }]);
    },
    [],
  );

  const closePopup = useCallback(() => {
    setStack((prev) => prev.slice(0, -1));
  }, []);

  const ctxValue = useMemo(() => ({ openPopup, closePopup }), [openPopup, closePopup]);

  // 모듈 레벨 핸들 동기화 — 비-React 코드에서 getPopupApi() 로 접근.
  useEffect(() => {
    _popupApi = ctxValue;
    return () => {
      if (_popupApi === ctxValue) _popupApi = null;
    };
  }, [ctxValue]);

  return (
    <PopupContext.Provider value={ctxValue}>
      <PopupOpenContext.Provider value={stack.length > 0}>
        {children}
      </PopupOpenContext.Provider>

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
            type={p.type}
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
