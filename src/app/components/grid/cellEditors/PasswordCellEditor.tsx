"use client";

import { useEffect, useRef } from "react";

export type PasswordCellEditorProps = {
  value?: string;
  maxLength?: number;
  onValueChange?: (v: any) => void;
  [key: string]: any;
};

// ag-grid 32 reactive 커스텀 에디터: 값은 반드시 ag-grid 가 주입하는
// onValueChange 로 알린다(controlled). getValue/useGridCellEditor 방식은
// reactive 모드에서 값이 전달되지 않아 첫 키 입력에 편집이 취소된다.
export function PasswordCellEditor(props: PasswordCellEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 편집 시작 시 기존값을 노출하지 않도록 편집값을 빈칸으로 리셋.
    props.onValueChange?.("");
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      autoComplete="off"
      name="pw-cell-editor-nofill"
      data-lpignore="true"
      data-1p-ignore="true"
      // 입력 글자는 CSS 로 마스킹(●). type=password 는 브라우저 비번관리자가 개입.
      // 폭은 셀에 고정(내용에 따라 넓어지지 않도록).
      style={
        {
          WebkitTextSecurity: "disc",
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          boxSizing: "border-box",
        } as any
      }
      value={props.value ?? ""}
      maxLength={props.maxLength}
      onChange={(e) => props.onValueChange?.(e.target.value)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") {
          e.preventDefault();
          props.api?.stopEditing?.();
        } else if (e.key === "Escape") {
          props.api?.stopEditing?.(true);
        }
      }}
      className="w-full h-full px-1 text-[11px] outline-none border-0 bg-white"
    />
  );
}
