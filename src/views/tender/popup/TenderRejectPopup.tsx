"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type RejectReasonContentProps = {
  reasons: { label: string; value: string }[];
  onConfirm: (data: { reasonCode: string; detail: string }) => void;
  onClose: () => void;
};

export default function RejectReasonContent({
  reasons,
  onConfirm,
  onClose,
}: RejectReasonContentProps) {
  const [reasonCode, setReasonCode] = useState("");
  const [detail, setDetail] = useState("");

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* 폼 영역 */}
      <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100">
        {/* 사유 선택 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            운송요청 거절사유
          </label>

          <select
            value={reasonCode}
            onChange={(e) => setReasonCode(e.target.value)}
            className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">선택하세요</option>
            {reasons.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* 상세 내용 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            운송요청 거절사유 세부내용
          </label>

          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-gray-300 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="세부 내용을 입력하세요"
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
          disabled={!reasonCode}
          onClick={() => onConfirm({ reasonCode, detail })}
          className="flex-1 h-11 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 transition"
        >
          저장
        </button>
      </div>
    </div>
  );
}
