"use client";

// 팝업 조회조건(검색조건) 공통 컴포넌트 — 카드형(헤더 + 조회 버튼 + 필드 그리드).
//   - 팝업 조회조건 표준 스타일(docs/claude/popup.md §6).
//   - fields 로 TEXT / COMBO / POPUP(코드·명·돋보기) 필드를 선언, onSearch 로 조회 실행.
//   - GridSearchPopupLayout 및 개별 팝업에서 공통으로 사용.

import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { ComboFilter } from "@/app/components/Search/filters/ComboFilter";
import { Lang } from "@/app/services/common/Lang";

// 라벨 내부 번역 — 언어팩 키 형식(LBL_*/BTN_* 등 대문자·언더스코어)만 Lang.get.
// 이미 번역된 문자열/한글 리터럴은 그대로 통과(이중 번역 "***" 방지).
const tLabel = (s: string) => (/^[A-Z][A-Z0-9_]+$/.test(s) ? Lang.get(s) : s);

type GridSearchFieldBase = {
  label: string;
  placeholder?: string;
  /** true 면 타입 불문 화면에서 값 수정 불가 (조회 스코프 고정 등) */
  disable?: boolean;
};

export type GridSearchInputField = GridSearchFieldBase & {
  type?: "text" | "combo" | "date";
  value: string;
  onChange: (v: string) => void;
  options?: { CODE: string; NAME: string }[];
  /** date 전용 — from-to 범위 하한/상한(YYYY-MM-DD). 브라우저가 범위 밖 선택을 막는다. */
  min?: string;
  max?: string;
};

/** 메인 조회조건 popup 타입처럼 코드+코드명 둘 다 표시 + 돋보기.
 *  picker 는 화면이 onClickSearch 로 제공 (disable 이면 돋보기 비활성). */
export type GridSearchPopupField = GridSearchFieldBase & {
  type: "popup";
  code: string;
  name: string;
  onChangeCode?: (v: string) => void;
  onChangeName?: (v: string) => void;
  onClickSearch?: () => void;
  onEnterSubmit?: (code: string, name: string) => void;
};

export type GridSearchField = GridSearchInputField | GridSearchPopupField;

type PopupSearchConditionProps = {
  fields: GridSearchField[];
  /** 미지정 시 헤더의 "조회" 버튼을 렌더하지 않는다 (검색 없는 입력 카드용). */
  onSearch?: () => void;
  /** 한 줄에 표시할 칸 수. 기본 min(필드수, 3). */
  columns?: number;
  searchBtnDisable?: boolean;
};

export function PopupSearchCondition({
  fields,
  onSearch,
  columns,
  searchBtnDisable = false,
}: PopupSearchConditionProps) {
  const cols = columns ?? Math.min(fields.length, 3);

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 bg-[var(--grid-header-bg)]">
        <div className="flex items-center gap-1.5 leading-none">
          <SlidersHorizontal className="w-3.5 h-3.5 text-color/80 flex-shrink-0" />
          <span className="text-[12px] font-semibold text-color tracking-widest uppercase leading-none">
            {searchBtnDisable ? "조회조건" : "조건"}
          </span>
        </div>
        {onSearch && (
          <Button
            variant="ghost"
            size="xs"
            disabled={searchBtnDisable}
            onClick={onSearch}
            className="h-6 px-3 rounded-full bg-white/15 hover:bg-white border border-white/30 text-color hover:text-[rgb(var(--primary))] text-[12px] font-semibold transition-all flex items-center gap-1"
            style={{ lineHeight: 1 }}
          >
            <Search className="w-3 h-3 flex-shrink-0" />
            <span className="leading-none">조회</span>
          </Button>
        )}
      </div>

      <div
        className="grid divide-x divide-y divide-slate-100"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {fields.map((f) => (
          <div
            key={f.label}
            className="flex flex-col px-3 py-2 bg-white hover:bg-blue-50/40 transition-colors group"
          >
            <label className="text-[10px] font-medium text-slate-400 mb-0.5 group-focus-within:text-blue-500 transition-colors">
              {tLabel(f.label)}
            </label>
            {f.type === "popup" ? (
              <div className="flex items-center gap-1.5 w-full min-w-0">
                <input
                  value={f.code}
                  onChange={(e) => f.onChangeCode?.(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    if (f.onEnterSubmit)
                      f.onEnterSubmit(e.currentTarget.value, "");
                    else onSearch?.();
                  }}
                  disabled={f.disable}
                  className="text-[12px] text-slate-700 bg-transparent outline-none border-none placeholder:text-slate-300 w-[80px] shrink-0 disabled:cursor-not-allowed disabled:text-slate-400"
                  placeholder="코드"
                />
                <span className="text-slate-200">|</span>
                {/* 코드명은 읽기전용 — 돋보기 선택/코드 Enter 로만 채워짐 */}
                <input
                  value={f.name}
                  readOnly
                  disabled={f.disable}
                  className="text-[12px] text-slate-700 bg-transparent outline-none border-none placeholder:text-slate-300 flex-1 min-w-0 disabled:cursor-not-allowed disabled:text-slate-400"
                  placeholder="코드명"
                />
                <button
                  type="button"
                  onClick={f.onClickSearch}
                  disabled={f.disable}
                  className="shrink-0 text-slate-400 hover:text-[rgb(var(--primary))] transition-colors disabled:cursor-not-allowed disabled:text-slate-300"
                  aria-label="검색"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : f.type === "combo" ? (
              <ComboFilter
                placeholder={f.placeholder ?? "선택"}
                options={f.options ?? []}
                value={f.value}
                onChange={f.onChange}
                disabled={f.disable}
                inputClassName="text-[12px] text-slate-700 bg-transparent outline-none border-none h-auto p-0"
              />
            ) : f.type === "date" ? (
              <input
                type="date"
                value={f.value}
                min={f.min}
                max={f.max}
                onChange={(e) => f.onChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
                disabled={f.disable}
                className="text-[12px] text-slate-700 bg-transparent outline-none border-none w-full disabled:cursor-not-allowed disabled:text-slate-400"
              />
            ) : (
              <input
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
                disabled={f.disable}
                className="text-[12px] text-slate-700 bg-transparent outline-none border-none placeholder:text-slate-300 w-full disabled:cursor-not-allowed disabled:text-slate-400"
                placeholder={f.placeholder ?? "입력"}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
