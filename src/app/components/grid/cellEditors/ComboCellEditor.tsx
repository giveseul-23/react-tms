"use client";
// src/app/components/grid/cellEditors/ComboCellEditor.tsx
//
// AG Grid 셀 편집기 — codeMap({ code: name }) 옵션을 커스텀 dropdown 으로 표시.
//   - 평소(view) 에는 cellRenderer 가 라벨(name) 표시 → 텍스트처럼 보임
//   - 편집 시 이 컴포넌트가 열려서 코드/명을 리스트로 노출
//
// native <select> 를 안 쓰는 이유:
//   AG Grid popup 모드에서 native select dropdown(브라우저 overlay) 의 option 클릭이
//   "popup 외부 클릭" 으로 인식되어 stopEditing 이 commit 보다 먼저 호출 → 값이 안 박힘.
//   커스텀 list 는 popup div 안에 있어서 그 문제 없음.
//
// processColumnDef 에서 type === "combo" + codeKey 컬럼에 자동 주입.

import React, { useEffect, useRef, useState } from "react";
import { useGridCellEditor } from "ag-grid-react";

export type ComboCellEditorProps = {
  /** AG Grid 가 주입하는 현재 셀 값. */
  value?: string;
  /** 코드 → 라벨 매핑. processColumnDef 가 codeMap[codeKey] 로 주입. */
  codeMap?: Record<string, string>;
  /** 다른 AG Grid props (api, node 등) */
  [key: string]: any;
};

export function ComboCellEditor(props: ComboCellEditorProps) {
  const initial = String(props.value ?? "");
  const [value, setValue] = useState<string>(initial);
  const valueRef = useRef<string>(initial);
  const containerRef = useRef<HTMLDivElement>(null);
  const codeMap: Record<string, string> = props.codeMap ?? {};
  const codes = Object.keys(codeMap);

  // AG Grid 가 commit 시점에 호출 — ref 의 최신값을 그대로 반환
  useGridCellEditor({
    getValue: () => valueRef.current,
    isCancelBeforeStart: () => false,
    isCancelAfterEnd: () => false,
  });

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const pick = (v: string) => {
    valueRef.current = v;
    setValue(v);
    // AG Grid 의 stopEditing → getValue 흐름이 popup 모드에서 가끔 누락되므로
    // node.setDataValue 로 직접 commit (onCellValueChanged 자동 발화 → EDIT_STS = "U")
    const field = props.colDef?.field ?? props.column?.getColDef?.().field;
    if (field && props.node?.setDataValue) {
      props.node.setDataValue(field, v);
    }
    // 편집 종료 (이미 commit 됐으므로 cancel=true 로 getValue 호출 회피)
    props.api?.stopEditing?.(true);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      props.api?.stopEditing?.(true); // cancel
    } else if (e.key === "Enter") {
      e.preventDefault();
      props.api?.stopEditing?.();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = codes.indexOf(value);
      const next = codes[Math.min(idx + 1, codes.length - 1)] ?? codes[0];
      if (next !== undefined) {
        valueRef.current = next;
        setValue(next);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = codes.indexOf(value);
      const prev = codes[Math.max(idx - 1, 0)] ?? codes[0];
      if (prev !== undefined) {
        valueRef.current = prev;
        setValue(prev);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      style={{
        width: "100%",
        minWidth: 180,
        maxHeight: 240,
        overflowY: "auto",
        background: "white",
        border: "1px solid #c7c7c7",
        borderRadius: 4,
        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        outline: "none",
        fontSize: "12px",
      }}
    >
      {/* 빈값 옵션 — 사용자가 명시적으로 클리어할 수 있도록 */}
      <Option
        label="―"
        selected={value === ""}
        onClick={() => pick("")}
      />
      {codes.map((code) => (
        <Option
          key={code}
          label={codeMap[code]}
          sub={code}
          selected={value === code}
          onClick={() => pick(code)}
        />
      ))}
    </div>
  );
}

function Option({
  label,
  sub,
  selected,
  onClick,
}: {
  label: string;
  sub?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onMouseDown={(e) => {
        // mousedown 으로 처리 → blur 전에 pick 실행되어 commit 안전
        e.preventDefault();
        onClick();
      }}
      style={{
        padding: "4px 8px",
        cursor: "pointer",
        background: selected ? "#e0f0ff" : "transparent",
        display: "flex",
        justifyContent: "space-between",
        gap: 8,
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.background = "#f5f5f5";
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.background = "transparent";
      }}
    >
      <span>{label}</span>
      {sub && <span style={{ color: "#888", fontSize: 11 }}>{sub}</span>}
    </div>
  );
}
