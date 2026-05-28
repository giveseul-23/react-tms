"use client";

import React, { useEffect, useRef } from "react";
import { useGridCellEditor } from "ag-grid-react";
import { commitRowChange } from "@/app/components/grid/gridUtils/rowStatus";

export type PasswordCellEditorProps = {
  value?: string;
  maxLength?: number;
  setRowData?: (updater: any) => void;
  [key: string]: any;
};

export function PasswordCellEditor(props: PasswordCellEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<string>(String(props.value ?? ""));
  const field = (props.colDef?.field ?? props.column?.getColId?.()) as
    | string
    | undefined;

  const commitValue = () => {
    if (!field) return;
    commitRowChange(
      props.setRowData,
      props.node?.data,
      field,
      valueRef.current,
    );
  };

  useGridCellEditor({
    getValue: () => valueRef.current,
    isCancelBeforeStart: () => false,
    isCancelAfterEnd: () => false,
  });

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, []);

  return (
    <input
      ref={inputRef}
      type="password"
      defaultValue={valueRef.current}
      maxLength={props.maxLength}
      onChange={(e) => {
        valueRef.current = e.target.value;
      }}
      onBlur={() => {
        commitValue();
      }}
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
