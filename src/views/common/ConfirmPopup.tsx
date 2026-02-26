"use client";
import { Check } from "lucide-react";

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
    <div className="flex flex-col items-center text-center px-4 py-6">
      {type === "error" ? (
        <div className="relative flex items-center justify-center mb-4">
          <span className="absolute inline-flex h-16 w-16 rounded-full bg-red-100 opacity-75 animate-ping" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <span className="text-red-500 text-xl font-bold">!</span>
          </div>
        </div>
      ) : (
        <div className="relative flex items-center justify-center mb-10">
          <div className="absolute h-20 w-20 rounded-full bg-blue-100 opacity-70" />

          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg">
            <Check className="text-white" />
          </div>
        </div>
      )}

      {/* Title */}
      {title && (
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
      )}
      {/* Description */}
      {description && (
        <p className="text-sm text-gray-500 whitespace-pre-line mb-6">
          {description}
        </p>
      )}
      {/* Buttons */}
      <div className="flex gap-3 w-full">
        <button
          type="button"
          onClick={onClose}
          className={`flex-1 h-11 rounded-md text-white font-medium transition ${
            type === "error"
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}
