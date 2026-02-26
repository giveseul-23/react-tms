"use client";

type ErrorConfirmModalProps = {
  title?: string;
  description?: string;
  confirmText?: string;
  onClose: () => void;
};

export default function ErrorConfirmModal({
  title,
  description,
  confirmText = "확인",
  onClose,
}: ErrorConfirmModalProps) {
  return (
    <div className="flex flex-col items-center text-center px-4 py-6">
      {/* Icon */}
      <div className="relative flex items-center justify-center mb-4">
        <span className="absolute inline-flex h-16 w-16 rounded-full bg-red-100 opacity-75 animate-ping" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <span className="text-red-500 text-xl font-bold">!</span>
        </div>
      </div>

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
          className="flex-1 h-11 rounded-md bg-red-500 text-white font-medium hover:bg-red-600 transition"
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}
