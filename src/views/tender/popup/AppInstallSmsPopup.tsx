"use client";

import { useState } from "react";

type AppInstallSmsContentProps = {
  defaultPhone?: string;
  onConfirm: (data: { phone: string }) => void;
  onClose: () => void;
};

export default function AppInstallSmsPopup({
  defaultPhone = "",
  onConfirm,
  onClose,
}: AppInstallSmsContentProps) {
  const [phone, setPhone] = useState(defaultPhone);

  const onlyNumber = (value: string) => {
    return value.replace(/[^0-9]/g, "");
  };

  const isValid = phone.length >= 10; // 기본 유효성 (10~11자리 가정)

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* 카드 */}
      <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-3 items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            전화번호 <span className="text-red-500">*</span>
          </label>

          <input
            value={phone}
            onChange={(e) => setPhone(onlyNumber(e.target.value))}
            placeholder='"-" 없이 숫자만 입력'
            className="col-span-2 h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-11 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
        >
          취소
        </button>

        <button
          type="button"
          disabled={!isValid}
          onClick={() => onConfirm({ phone })}
          className="flex-1 h-11 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 transition"
        >
          전송
        </button>
      </div>
    </div>
  );
}
