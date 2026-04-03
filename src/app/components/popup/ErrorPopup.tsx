// app/components/popup/ErrorPopup.tsx
// PopupProvider 없이도 독립적으로 사용 가능한 오류 팝업
// 로그인 페이지처럼 PopupProvider 외부에서 사용하는 용도

import React from "react";
import { createPortal } from "react-dom";
import { AlertCircle, X } from "lucide-react";

interface ErrorPopupProps {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export function ErrorPopup({ open, title = "오류", message, onClose }: ErrorPopupProps) {
  if (!open) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-[9998]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="fixed z-[9999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   w-full max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-red-500">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
            <span className="text-sm font-semibold text-white">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-red-400 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200
                       text-slate-700 rounded-md transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
