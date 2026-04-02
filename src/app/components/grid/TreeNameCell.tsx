"use client";
// app/components/grid/TreeNameCell.tsx
//
// TreeGrid 의 이름 컬럼에서 사용하는 공통 셀 렌더러입니다.
// 연결선, 펼치기/접기 버튼, 아이콘, 라벨을 렌더링합니다.
//
// 사용 예시 (페이지의 renderNameCell prop):
//
//   renderNameCell={(params, ctx) => (
//     <TreeNameCell
//       id={params.data.id}
//       level={params.data.level}
//       label={params.data.msg_desc}
//       hasChild={hasChildSet.has(params.data.id)}
//       icon={params.data.isVirtualRoot ? "🗂️" : undefined}
//       ctx={ctx}
//     />
//   )}

import React from "react";
import type { TreeCellContext } from "./TreeGrid";

type Props = {
  id: string;
  level: number;
  label: React.ReactNode;
  hasChild: boolean;
  ctx: TreeCellContext;
  /** 커스텀 아이콘. 미지정 시 hasChild+isExpanded 기반 폴더/파일 이모지 */
  icon?: React.ReactNode;
  /** 레벨당 들여쓰기 px (기본 18) */
  indentPx?: number;
  /** 연결선 색상 (기본 #7e7e7e) */
  lineColor?: string;
};

export default function TreeNameCell({
  id,
  level,
  label,
  hasChild,
  ctx,
  icon,
  indentPx = 18,
  lineColor = "#7e7e7e",
}: Props) {
  const { isExpanded, isLastChild, toggle } = ctx;

  const defaultIcon = hasChild ? (isExpanded ? "📂" : "📁") : "📄";

  return (
    <div
      className="flex items-center h-full"
      style={{ paddingLeft: level * indentPx }}
    >
      {/* 세로 + 가로 연결선 */}
      {level > 0 && (
        <div
          className="shrink-0"
          style={{ width: 16, position: "relative", height: "100%" }}
        >
          <div
            style={{
              position: "absolute",
              left: 7,
              top: isLastChild ? "-50%" : "-100%",
              bottom: isLastChild ? "50%" : "-100%",
              width: 1,
              background: lineColor,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 7,
              top: "50%",
              width: 9,
              height: 1,
              background: lineColor,
              pointerEvents: "none",
            }}
          />
        </div>
      )}

      {/* 펼치기/접기 버튼 */}
      {hasChild ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggle(id);
          }}
          className="shrink-0 flex items-center justify-center w-4 h-4 text-gray-500 hover:text-gray-800"
          style={{ fontSize: 9 }}
        >
          {isExpanded ? "▼" : "▶"}
        </button>
      ) : (
        <span className="shrink-0 w-4" />
      )}

      {/* 아이콘 */}
      <span className="shrink-0 mr-1 text-[12px]">{icon ?? defaultIcon}</span>

      {/* 라벨 */}
      <span className="truncate" style={{ fontWeight: hasChild ? 600 : 400 }}>
        {label}
      </span>
    </div>
  );
}
