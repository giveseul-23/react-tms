"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "../utils";
import { Input } from "../input";
import { Label } from "../label";
import { Button } from "../button";

type PopupSrchFilterProps = React.ComponentPropsWithoutRef<"div"> & {
  label?: string;
  code: string;
  name: string;
  onChangeCode: (v: string) => void;
  onChangeName: (v: string) => void;
  onClickSearch: () => void;
  codeId?: string;
  nameId?: string;
  required?: boolean;
};

function PopupSrchFilter({
  className,
  label = "팝업",
  code,
  name,
  onChangeCode,
  onChangeName,
  onClickSearch,
  codeId = "lgstGroupCode",
  nameId = "lgstGroupName",
  required,
  ...props
}: PopupSrchFilterProps) {
  return (
    <div
      className={cn("w-full min-w-0 flex flex-col gap-2", className)}
      {...props}
    >
      {/* ✅ 인풋 2개 + 돋보기 (색/라운드 = Input 기본값 사용) */}
      <div className="flex items-center gap-3">
        {/* 코드 */}
        <Input
          id={codeId}
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          placeholder="코드"
          className="w-[110px]" // ✅ 폭만 지정 (색/라운드는 건드리지 않음)
        />

        {/* 센터명 + 돋보기(인풋 안) */}
        <div className="relative flex-1">
          <Input
            id={nameId}
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="코드명"
            className="pr-10" // ✅ 아이콘 공간만 확보
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

export { PopupSrchFilter };
export type { PopupSrchFilterProps };
