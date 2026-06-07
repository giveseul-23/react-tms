"use client";
// 입력 마스크 텍스트 에디터 (센차 텍스트필드 maskRe 대응).
//   - maskRe 정규식과 매칭되는 문자만 허용 (키입력/붙여넣기 모두 필터).
//   - commit 은 commitRowChange 로 React rows state 동기화 (PasswordCellEditor 와 동일 패턴).

import { useEffect, useMemo, useRef } from "react";
import { useGridCellEditor } from "ag-grid-react";
import { commitRowChange } from "@/app/components/grid/gridUtils/rowStatus";

export type MaskedTextCellEditorProps = {
  value?: string;
  maxLength?: number;
  maskRe?: RegExp;
  setRowData?: (updater: any) => void;
  [key: string]: any;
};

export function MaskedTextCellEditor(props: MaskedTextCellEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<string>(String(props.value ?? ""));
  const field = (props.colDef?.field ?? props.column?.getColId?.()) as
    | string
    | undefined;

  // g 플래그 제거(문자 단위 test 시 lastIndex 영향 방지).
  const maskRe = useMemo(() => {
    const re = props.maskRe;
    if (!re) return null;
    return new RegExp(re.source, re.flags.replace("g", ""));
  }, [props.maskRe]);

  const mask = (s: string) =>
    maskRe
      ? s
          .split("")
          .filter((ch) => maskRe.test(ch))
          .join("")
      : s;

  const commitValue = () => {
    if (!field) return;
    commitRowChange(props.setRowData, props.node?.data, field, valueRef.current);
  };

  useGridCellEditor({
    getValue: () => valueRef.current,
    isCancelBeforeStart: () => false,
    isCancelAfterEnd: () => false,
  } as any);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={valueRef.current}
      maxLength={props.maxLength}
      onChange={(e) => {
        const filtered = mask(e.target.value);
        if (filtered !== e.target.value) e.target.value = filtered;
        valueRef.current = filtered;
      }}
      onBlur={() => commitValue()}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commitValue();
          props.api?.stopEditing?.();
        } else if (e.key === "Escape") {
          props.api?.stopEditing?.(true);
        }
      }}
      className="w-full h-full px-1 text-[11px] outline-none border-0 bg-white"
    />
  );
}
