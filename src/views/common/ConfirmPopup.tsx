"use client";
import { Check, CircleAlert } from "lucide-react";

type ConfirmModalProps = {
  title?: string;
  description?: string;
  confirmText?: string;
  onClose: () => void;
  type?: string;
};

export default function ConfirmModal({
  title,
  description,
  confirmText = "확인",
  onClose,
  type,
}: ConfirmModalProps) {
  return (
    // py-6 → pt-4 pb-2 로 완화, px-4 제거 (PopupShell p-6 로 이미 적용)
    // 스크롤이 필요할 때 내부에서 자연스럽게 늘어나도록 고정 높이/패딩 최소화
    <div className="flex flex-col items-center text-center">
      {type === "error" && (
        <div className="relative flex items-center justify-center mb-4 mt-2">
          <span className="absolute inline-flex h-16 w-16 rounded-full bg-red-100 opacity-75 animate-ping" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <span className="text-red-500 text-xl font-bold">!</span>
          </div>
        </div>
      )}
      {type === "normal" && (
        <div className="relative flex items-center justify-center mb-6 mt-2">
          <div className="absolute h-20 w-20 rounded-full bg-blue-100 opacity-70" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg">
            <Check className="text-white" />
          </div>
        </div>
      )}
      {type === "check" && (
        <div className="relative flex items-center justify-center mb-6 mt-2">
          <div className="absolute h-20 w-20 rounded-full bg-gray-100 opacity-70" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gray-300 shadow-lg">
            <CircleAlert className="text-white" />
          </div>
        </div>
      )}

      {/* Title */}
      {title && (
        <h2 className="text-lg font-semibold text-gray-800 mb-2 dark:text-white">
          {title}
        </h2>
      )}

      {/* Description — 긴 오류 메시지가 들어와도 잘리지 않도록 break-words 적용 */}
      {description && (
        <p className="text-sm text-gray-500 whitespace-pre-line mb-4 break-words w-full text-left">
          {description}
        </p>
      )}

      {/* Buttons */}
      <div className="flex gap-3 w-full mt-2">
        <button
          type="button"
          onClick={onClose}
          className={`flex-1 h-11 rounded-md text-white font-medium transition
            ${type === "error" ? "bg-red-500 hover:bg-red-600" : ""}
            ${type === "confirm" ? "bg-blue-500 hover:bg-blue-600" : ""}
            ${type === "check" ? "bg-gray-500 hover:bg-gray-600" : ""}
            ${!type ? "bg-slate-500 hover:bg-slate-600" : ""}`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}
