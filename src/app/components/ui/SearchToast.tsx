// src/app/components/ui/SearchToast.tsx
"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Search } from "lucide-react";

type ToastState = {
  visible: boolean;
  count: number;
  timestamp: number;
};

let _setState: ((s: ToastState) => void) | null = null;

/** SearchFilters 내부에서 호출 — 조회 완료 토스트 표시 */
export function showSearchToast(count: number) {
  _setState?.({ visible: true, count, timestamp: Date.now() });
}

export function SearchToast() {
  const [state, setState] = useState<ToastState>({
    visible: false,
    count: 0,
    timestamp: 0,
  });

  useEffect(() => {
    _setState = setState;
    return () => { _setState = null; };
  }, []);

  // 3초 후 자동 숨김
  useEffect(() => {
    if (!state.visible) return;
    const timer = setTimeout(() => {
      setState((s) => ({ ...s, visible: false }));
    }, 3000);
    return () => clearTimeout(timer);
  }, [state.timestamp]);

  if (!state.visible) return null;

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-2.5
        px-4 py-2.5 rounded-lg shadow-lg
        bg-white border border-gray-200
        text-sm text-gray-700
        animate-in fade-in slide-in-from-bottom-2 duration-200
      `}
    >
      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
      <span>
        조회 완료 —{" "}
        <span className="font-semibold text-gray-900">
          {state.count.toLocaleString()}건
        </span>
      </span>
    </div>
  );
}
