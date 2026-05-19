"use client";

import { ReactNode } from "react";

// 폼 팝업 외곽 (카드 wrapper + 취소/확인 버튼) 만 책임.
// 필드 부분은 children 으로 자유 작성 — 필드 패턴은 Guide_FormPopup 참고.
// 폭 조절은 호출측 openPopup({ width: "lg" | "xl" | "2xl" ... }) 로 — 이 컴포넌트는 폭 관여 안 함.
//
// 사용 예:
//   <FormPopupLayout
//     cardClassName="space-y-4"     // 여러 필드 섞이면 추가
//     confirmLabel="저장"           // 기본 "확인"
//     isValid={!!reasonCode}
//     onCancel={onClose}
//     onConfirm={() => onConfirm({...})}
//   >
//     {/* 필드 패턴 A/B/C/D — Guide_FormPopup 의 children 부분 참고 */}
//   </FormPopupLayout>

type FormPopupLayoutProps = {
  children: ReactNode;
  cardClassName?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  isValid?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function FormPopupLayout({
  children,
  cardClassName,
  cancelLabel = "취소",
  confirmLabel = "확인",
  isValid = true,
  onCancel,
  onConfirm,
}: FormPopupLayoutProps) {
  return (
    <div className="w-full">
      <div
        className={`bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-slate-800${
          cardClassName ? ` ${cardClassName}` : ""
        }`}
      >
        {children}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-11 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
        >
          {cancelLabel}
        </button>

        <button
          type="button"
          disabled={!isValid}
          onClick={onConfirm}
          className="flex-1 h-11 rounded-lg bg-[rgb(var(--primary))] text-white font-medium hover:bg-[rgb(var(--primary-hover))] disabled:opacity-40 transition"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
