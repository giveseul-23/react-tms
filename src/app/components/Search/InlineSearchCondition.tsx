"use client";

// 인라인 조회조건 공통 컴포넌트 — 단일 행(라벨이 위젯 왼쪽에 inline) 바형.
//   - 탭 내부 등 본문에 가벼운 조회조건 줄을 둘 때 사용.
//   - fields 는 PopupSearchCondition 과 동일한 API(text/combo/date/popup) 재사용 → drop-in 교체.
//   - 카드형(라벨 위 floating)이 필요하면 PopupSearchCondition 을 쓴다.

import { useState } from "react";
import { Search, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { ComboFilter } from "@/app/components/Search/filters/ComboFilter";
import { Lang } from "@/app/services/common/Lang";
import type { GridSearchField } from "@/app/components/popup/PopupSearchCondition";

// 라벨 내부 번역 — 언어팩 키 형식(LBL_*/대문자·언더스코어)만 Lang.get.
// 이미 번역된 문자열/한글 리터럴은 그대로 통과(이중 번역 "***" 방지).
const tLabel = (s: string) => (/^[A-Z][A-Z0-9_]+$/.test(s) ? Lang.get(s) : s);

// 위젯 크기 통일 토큰 — 모든 입력은 h-6, 단일 입력 150px / popup 190px.
const W_SINGLE = "w-[150px]";
const W_POPUP = "w-[190px]";

// 접힘 상태 요약용 — 필드별 표시값 추출(combo 는 코드→NAME, popup 은 코드명/코드).
function fieldSummary(f: GridSearchField): string | null {
  if (f.type === "popup") {
    const v = f.name?.trim() || f.code?.trim();
    return v ? `${tLabel(f.label)}: ${v}` : null;
  }
  const raw = f.value?.trim();
  if (!raw) return null;
  if (f.type === "combo") {
    if (raw === "ALL") return null; // 'ALL'(전체) sentinel 은 요약에서 제외
    const opt = (f.options ?? []).find((o) => o.CODE === raw);
    return `${tLabel(f.label)}: ${opt?.NAME ?? raw}`;
  }
  return `${tLabel(f.label)}: ${raw}`;
}

type InlineSearchConditionProps = {
  fields: GridSearchField[];
  /** 미지정 시 "조회" 버튼을 렌더하지 않는다 (검색 없는 입력 줄용). */
  onSearch?: () => void;
  searchBtnDisable?: boolean;
  /** 좌측 타이틀 — 언어팩 키/리터럴. 기본 "조회조건". */
  title?: string;
  /** 접힘 상태 controlled — open/onOpenChange 둘 다 주면 외부 제어(탭별 상태 유지 등),
   *  없으면 내부 state 사용(하위호환). */
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
};

export function InlineSearchCondition({
  fields,
  onSearch,
  searchBtnDisable = false,
  title = "조회조건",
  open: openProp,
  onOpenChange,
}: InlineSearchConditionProps) {
  const [openState, setOpenState] = useState(true);
  const open = openProp ?? openState;
  const toggleOpen = () =>
    onOpenChange ? onOpenChange(!open) : setOpenState((v) => !v);

  const summary = fields.map(fieldSummary).filter(Boolean) as string[];

  // 라이트 버튼(조회·토글 공통) — 흰 배경 + 테두리, hover 시 primary.
  const lightBtn =
    "h-6 rounded-md border border-slate-200 bg-white text-slate-500 hover:text-[rgb(var(--primary))] text-[11px] font-semibold";

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg">
      {/* 타이틀 라인 — 좌측 타이틀(+접힘 시 요약), 우측 조회·접기 */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">
            {tLabel(title)}
          </span>
          {!open && summary.length > 0 && (
            <span className="ml-2 text-[11px] text-slate-500 truncate min-w-0">
              {summary.join(" · ")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onSearch && (
            <Button
              variant="ghost"
              size="xs"
              disabled={searchBtnDisable}
              onClick={onSearch}
              className={`${lightBtn} px-3 flex items-center gap-1`}
            >
              <Search className="w-3 h-3 flex-shrink-0" />
              <span className="leading-none">조회</span>
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={toggleOpen}
            title={open ? "접기" : "펼치기"}
            className={`${lightBtn} w-7 px-0`}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* 본문 — 펼침 시 필드 입력 영역 */}
      {open && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 pb-2">
          {fields.map((f) => (
          <div key={f.label} className="flex items-center gap-1.5 min-w-0">
            <label
              onDoubleClick={() => {
                // 조회조건과 동일 — 라벨 더블클릭 시 해당 필드 초기화
                if (f.type === "popup") {
                  f.onChangeCode?.("");
                  f.onChangeName?.("");
                } else {
                  f.onChange("");
                }
              }}
              title="더블클릭으로 초기화"
              className="text-[11px] font-medium text-slate-600 leading-none whitespace-nowrap cursor-pointer select-none hover:text-[rgb(var(--primary))] transition-colors"
            >
              {tLabel(f.label)}
            </label>
            {f.type === "popup" ? (
              <div
                className={`${W_POPUP} flex items-center gap-1 h-6 px-2 box-border border border-slate-200 rounded-md bg-white`}
              >
                <input
                  value={f.code}
                  onChange={(e) => {
                    // 코드를 직접 수정하면 이전 선택 코드명은 빈값으로 재설정(동기화)
                    f.onChangeCode?.(e.target.value);
                    f.onChangeName?.("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    if (f.onEnterSubmit)
                      f.onEnterSubmit(e.currentTarget.value, "");
                    else onSearch?.();
                  }}
                  disabled={f.disable}
                  className="w-[60px] shrink-0 text-[11px] text-slate-700 bg-transparent outline-none border-none placeholder:text-slate-300 disabled:cursor-not-allowed disabled:text-slate-400"
                  placeholder="코드"
                />
                <span className="text-slate-200">|</span>
                {/* 코드명은 읽기전용 — 돋보기 선택/코드 Enter 로만 채워짐 */}
                <input
                  value={f.name}
                  readOnly
                  disabled={f.disable}
                  className="flex-1 min-w-0 text-[11px] text-slate-700 bg-transparent outline-none border-none placeholder:text-slate-300 disabled:cursor-not-allowed disabled:text-slate-400"
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
              <div className={W_SINGLE}>
                <ComboFilter
                  placeholder={f.placeholder ?? "선택"}
                  options={f.options ?? []}
                  value={f.value}
                  onChange={f.onChange}
                  disabled={f.disable}
                  inputClassName="!h-6 box-border border border-slate-200 rounded-md bg-white text-[11px]"
                />
              </div>
            ) : f.type === "date" ? (
              <input
                type="date"
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
                disabled={f.disable}
                className={`${W_SINGLE} h-6 px-2 box-border text-[11px] text-slate-700 border border-slate-200 rounded-md bg-white outline-none focus:border-[rgb(var(--primary))] disabled:bg-slate-50 disabled:cursor-not-allowed`}
              />
            ) : (
              <input
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
                disabled={f.disable}
                className={`${W_SINGLE} h-6 px-2 box-border text-[11px] text-slate-700 border border-slate-200 rounded-md bg-white outline-none focus:border-[rgb(var(--primary))] placeholder:text-slate-300 disabled:bg-slate-50 disabled:cursor-not-allowed`}
                placeholder={f.placeholder ?? "입력"}
              />
            )}
          </div>
          ))}
        </div>
      )}
    </div>
  );
}
