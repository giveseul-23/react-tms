"use client";
// app/components/grid/TrackPanel.tsx
// DataGrid 하단의 "추적 결과" expand 패널. onTrack 액션 실행 시 컨텐츠가 들어오며,
// max-height/opacity 트랜지션으로 펼침/접힘 애니메이션.

import React from "react";

type TrackPanelProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function TrackPanel({ open, onClose, children }: TrackPanelProps) {
  return (
    <div
      className={`overflow-hidden transition-all duration-400 ease-in-out ${
        open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
      }`}
      style={{ transitionProperty: "max-height, opacity" }}
    >
      <div className="mt-1">
        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-gray-800">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            추적 결과
          </span>
          <button
            onClick={onClose}
            className="text-[11px] text-gray-400 hover:text-gray-600 px-2 py-0.5 rounded hover:bg-gray-200 transition-colors"
          >
            닫기
          </button>
        </div>
        <div className="p-2">{children}</div>
      </div>
    </div>
  );
}
