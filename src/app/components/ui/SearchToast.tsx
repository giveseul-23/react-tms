// src/app/components/ui/SearchToast.tsx
"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

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

  const isEmpty = state.count === 0;

  return (
    <div
      className={`
        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
        flex items-center gap-2.5
        px-5 py-3 rounded-lg shadow-lg
        text-[13px] font-medium
        animate-in fade-in slide-in-from-top-2 duration-200
        ${
          isEmpty
            ? "bg-amber-50 border border-amber-300 text-amber-800"
            : "bg-emerald-50 border border-emerald-300 text-emerald-800"
        }
      `}
    >
      {isEmpty ? (
        <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0" />
      ) : (
        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
      )}
      <span>
        {isEmpty ? "조회 결과가 없습니다" : (
          <>
            조회 완료 —{" "}
            <span className="font-bold">
              {state.count.toLocaleString()}건
            </span>
          </>
        )}
      </span>
    </div>
  );
}
