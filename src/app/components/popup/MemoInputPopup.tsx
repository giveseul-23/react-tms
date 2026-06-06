"use client";
// 공통 메모 입력 팝업 — 센차 TruckDispatchConfirmMemoPop / AddMemoPop 대응.
// PopupShell 안에 들어가는 body. textarea + 저장/취소. 빈값이면 저장 비활성.
import { useState } from "react";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  /** 상단 안내 문구 (예: "선택한 N건에 메모 일괄 등록"). 없으면 미표시. */
  infoText?: string;
  defaultValue?: string;
  onConfirm: (text: string) => void;
  onClose: () => void;
};

export default function MemoInputPopup({
  infoText,
  defaultValue = "",
  onConfirm,
  onClose,
}: Props) {
  const [text, setText] = useState(defaultValue);
  const disabled = text.trim().length === 0;

  return (
    <div className="flex flex-col gap-4">
      {infoText && (
        <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-[12px] text-blue-700">
          ⓘ {infoText}
        </div>
      )}
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        maxLength={4000}
        placeholder={Lang.get("LBL_MEMO_ENTER_PLAIN")}
        className="w-full resize-none rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="h-11 flex-1 rounded-md bg-gray-200 font-medium text-gray-700 transition hover:bg-gray-300"
        >
          {Lang.get("BTN_CANCEL")}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onConfirm(text)}
          className="h-11 flex-1 rounded-md bg-blue-500 font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
        >
          {Lang.get("BTN_SAVE")}
        </button>
      </div>
    </div>
  );
}
