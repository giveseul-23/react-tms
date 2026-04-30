"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "../../ui/utils";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

export type PopupFilterProps = {
  className?: string;

  code: string;
  name: string;

  onChangeCode?: (v: string) => void;
  onChangeName?: (v: string) => void;
  onClickSearch: () => void;
  /**
   * code/name input 에서 Enter 입력 시 호출.
   *   - code 필드 Enter → name 자동 비우고 onEnterSubmit(code, "")
   *   - name 필드 Enter → code 자동 비우고 onEnterSubmit("", name)
   */
  onEnterSubmit?: (code: string, name: string) => void;

  codeId?: string;
  nameId?: string;
  required?: boolean;
};

export function PopupFilter({
  className,
  code = "",
  name = "",
  onChangeCode,
  onChangeName,
  onClickSearch,
  onEnterSubmit,
  codeId,
  nameId,
}: PopupFilterProps) {
  const onCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    e.stopPropagation();
    const codeVal = e.currentTarget.value;
    onChangeName?.("");
    onEnterSubmit?.(codeVal, "");
  };

  const onNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    e.stopPropagation();
    const nameVal = e.currentTarget.value;
    onChangeCode?.("");
    onEnterSubmit?.("", nameVal);
  };

  return (
    <div className={cn("w-full min-w-0 flex flex-col gap-2", className)}>
      <div className="flex items-center gap-3">
        {/* 코드 */}
        <Input
          id={codeId}
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          onKeyDown={onCodeKeyDown}
          placeholder="코드"
          className="w-[110px]"
        />

        {/* 센터명 + 돋보기 */}
        <div className="relative flex-1">
          <Input
            id={nameId}
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            onKeyDown={onNameKeyDown}
            placeholder="코드명"
            className="pr-10"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClickSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            aria-label="검색"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
