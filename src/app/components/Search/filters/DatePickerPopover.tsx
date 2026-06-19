"use client";
// ────────────────────────────────────────────────────────────
// 공통 Date / Datetime Picker 팝오버
//   - withTime=false → YYYY-MM-DD 선택만
//   - withTime=true  → YYYY-MM-DDTHH:MM:SS 선택 (시간 스피너 포함)
//   - [오늘] 버튼으로 오늘 날짜로 리셋
//   - [확인] / [취소] 버튼으로 적용/닫기
// ────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { format, parse, isValid } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/app/components/ui/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { Calendar } from "@/app/components/ui/calendar";
import { Input } from "@/app/components/ui/input";

const MONTH_LABELS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

// 월/년 선택 화면 (caption "N월 YYYY" 버튼 클릭 시 표시)
function MonthYearPicker({
  initialYear,
  currentYear,
  currentMonth,
  onSelect,
}: {
  initialYear: number;
  currentYear: number;
  currentMonth: number;
  onSelect: (year: number, month: number) => void;
}) {
  const [year, setYear] = useState<number>(initialYear);
  return (
    <div className="p-3 w-[252px]">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setYear((y) => y - 1)}
          className="size-7 flex items-center justify-center rounded border border-input bg-background hover:bg-accent"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-medium">{year}년</span>
        <button
          type="button"
          onClick={() => setYear((y) => y + 1)}
          className="size-7 flex items-center justify-center rounded border border-input bg-background hover:bg-accent"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {MONTH_LABELS.map((label, i) => {
          const isSelected = year === currentYear && i === currentMonth;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(year, i)}
              className={cn(
                "h-9 text-xs rounded border transition-colors",
                isSelected
                  ? "bg-primary border-primary text-[rgb(var(--primary))]"
                  : "border-input bg-background hover:bg-accent",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 연 선택 그리드 (precision="year")
function YearPicker({
  initialYear,
  selectedYear,
  onSelect,
}: {
  initialYear: number;
  selectedYear?: number;
  onSelect: (year: number) => void;
}) {
  const [base, setBase] = useState<number>(initialYear - 5);
  const years = Array.from({ length: 12 }, (_, i) => base + i);
  return (
    <div className="p-3 w-[252px]">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setBase((b) => b - 12)}
          className="size-7 flex items-center justify-center rounded border border-input bg-background hover:bg-accent"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-medium">
          {years[0]} - {years[11]}
        </span>
        <button
          type="button"
          onClick={() => setBase((b) => b + 12)}
          className="size-7 flex items-center justify-center rounded border border-input bg-background hover:bg-accent"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {years.map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => onSelect(y)}
            className={cn(
              "h-9 text-xs rounded border transition-colors",
              y === selectedYear
                ? "bg-primary border-primary text-[rgb(var(--primary))]"
                : "border-input bg-background hover:bg-accent",
            )}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  withTime?: boolean;
  /** 선택 단위 — "day"(기본, YYYY-MM-DD) / "month"(YYYY-MM) / "year"(YYYY). */
  precision?: "year" | "month" | "day";
  className?: string;
  placeholder?: string;
  /** true 면 트리거를 캘린더 아이콘 단일 버튼으로 표시 (값 텍스트 숨김).
   *  그리드 셀처럼 값 텍스트를 외부에서 렌더하고 클릭 버튼만 노출할 때 사용. */
  iconOnly?: boolean;
  /** 빈값(공백) 커밋 허용 — 비필수 필드용. false 면 비우고 벗어나도 이전 값으로 원복. */
  allowClear?: boolean;
  /** 입력 크기 프리셋 — "sm"(기본, 조회조건/그리드) / "lg"(폼 팝업 Field 와 동일: text-sm·rounded-lg·h-10). */
  size?: "sm" | "lg";
};

// value → { date, time } 분해
function parseValue(
  value: string,
  withTime: boolean,
  precision: "year" | "month" | "day" = "day",
): { date?: Date; time: string } {
  if (!value) return { time: "00:00:00" };
  if (precision === "year") {
    const parsed = parse(value, "yyyy", new Date());
    return { date: isValid(parsed) ? parsed : undefined, time: "00:00:00" };
  }
  if (precision === "month") {
    const parsed = parse(value, "yyyy-MM", new Date());
    return { date: isValid(parsed) ? parsed : undefined, time: "00:00:00" };
  }
  if (withTime) {
    const [datePart, timeRaw = "00:00:00"] = value.split("T");
    const parsed = parse(datePart, "yyyy-MM-dd", new Date());
    const time =
      timeRaw.length === 5
        ? `${timeRaw}:00`
        : timeRaw.slice(0, 8) || "00:00:00";
    return { date: isValid(parsed) ? parsed : undefined, time };
  }
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return { date: isValid(parsed) ? parsed : undefined, time: "00:00:00" };
}

// 사용자 직접 입력 텍스트 → 저장 문자열(정규화). 유효하지 않으면 null.
function parseInput(
  text: string,
  withTime: boolean,
  precision: "year" | "month" | "day",
): string | null {
  const t = text.trim();
  if (precision === "year") {
    return /^\d{4}$/.test(t) && isValid(parse(t, "yyyy", new Date()))
      ? t
      : null;
  }
  if (precision === "month") {
    const m = parse(t, "yyyy-MM", new Date());
    return /^\d{4}-\d{2}$/.test(t) && isValid(m) ? format(m, "yyyy-MM") : null;
  }
  if (withTime) {
    const [datePart, timeRaw = "00:00:00"] = t.replace(" ", "T").split("T");
    const d = parse(datePart, "yyyy-MM-dd", new Date());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart) || !isValid(d)) return null;
    const time = /^\d{2}:\d{2}(:\d{2})?$/.test(timeRaw)
      ? timeRaw.length === 5
        ? `${timeRaw}:00`
        : timeRaw
      : "00:00:00";
    return `${format(d, "yyyy-MM-dd")}T${time}`;
  }
  const d = parse(t, "yyyy-MM-dd", new Date());
  return /^\d{4}-\d{2}-\d{2}$/.test(t) && isValid(d)
    ? format(d, "yyyy-MM-dd")
    : null;
}

// 인라인 입력 마스크 — precision/withTime 별 템플릿(글자=숫자자리, 그 외=구분자)
function maskTemplate(
  withTime: boolean,
  precision: "year" | "month" | "day",
): string {
  if (precision === "year") return "YYYY";
  if (precision === "month") return "YYYY-MM";
  return withTime ? "YYYY-MM-DD HH:MM:SS" : "YYYY-MM-DD";
}

function maxDigitsFor(
  withTime: boolean,
  precision: "year" | "month" | "day",
): number {
  if (precision === "year") return 4;
  if (precision === "month") return 6;
  return withTime ? 14 : 8;
}

// 저장값 → 숫자만 추출
function digitsFromValue(value: string): string {
  return (value || "").replace(/\D/g, "");
}

// 숫자열을 템플릿에 채워 "YYYY-MM-DD" 형태로 — 구분자 자동 삽입, 숫자만큼만 채움
function maskDigits(digits: string, template: string): string {
  let out = "";
  let di = 0;
  for (let i = 0; i < template.length && di < digits.length; i++) {
    const ch = template[i];
    if (/[A-Za-z]/.test(ch)) out += digits[di++];
    else out += ch;
  }
  return out;
}

// 숫자 인덱스가 속한 2자리 그룹의 [min,max] — 연도(0~3)는 null(제약 없음)
function digitGroupRange(
  index: number,
  withTime: boolean,
  precision: "year" | "month" | "day",
): [number, number] | null {
  if (index < 4 || precision === "year") return null; // 연도
  if (index < 6) return [1, 12]; // 월
  if (precision === "month") return null;
  if (index < 8) return [1, 31]; // 일
  if (!withTime) return null;
  if (index < 10) return [0, 23]; // 시
  if (index < 12) return [0, 59]; // 분
  return [0, 59]; // 초
}

// 숫자 입력 정규화 — 자리별 범위 검증(월 01~12 / 일 01~31 / 시 00~23 / 분·초 00~59).
//  - 둘째 자리 오버플로(월 "1"+"3"=13, 일 "3"+"2"=32, "00")는 거부하고 그 뒤도 버린다.
//  - 첫 자리가 "십의 자리"로 불가능하지만 한 자리 값으로는 유효하면 0 을 자동으로 붙인다(월 "6"→"06").
function sanitizeDateDigits(
  raw: string,
  withTime: boolean,
  precision: "year" | "month" | "day",
  maxDigits: number,
): string {
  const digits = raw.replace(/\D/g, "");
  let out = "";
  for (const ch of digits) {
    if (out.length >= maxDigits) break;
    const idx = out.length; // 이 숫자가 들어갈 위치
    const range = digitGroupRange(idx, withTime, precision);
    if (range) {
      const [min, max] = range;
      const pos = (idx - 4) % 2; // 0=십의자리, 1=일의자리
      const d = Number(ch);
      if (pos === 0) {
        const canBeTens = d * 10 <= max && d * 10 + 9 >= min;
        if (canBeTens) {
          out += ch;
        } else if (d >= min && d <= max) {
          out += "0" + ch; // 십의자리 불가 → 0 자동 패딩(예: 6 → 06)
        } else {
          break;
        }
        continue;
      }
      const v = Number(out[out.length - 1] + ch); // 직전 자리 + 현재 자리
      if (v < min || v > max) break;
    }
    out += ch;
  }
  return out.slice(0, maxDigits);
}

export function DatePickerPopover({
  id,
  value,
  onChange,
  withTime = false,
  precision = "day",
  className,
  placeholder,
  iconOnly = false,
  allowClear = false,
  size = "sm",
}: Props) {
  const isLg = size === "lg";
  // 입력/오버레이/아이콘 크기 프리셋 — 셋을 함께 맞춰 마스크 정렬 유지
  const inputSizeCls = isLg
    ? "h-10 pl-3 !pr-9 text-sm rounded-lg border-gray-300"
    : "h-7 pl-2 !pr-6 text-[11px] rounded-md border-input bg-input-background";
  const overlaySizeCls = isLg ? "pl-3 text-sm" : "pl-2 text-[11px]";
  const iconPosCls = isLg ? "right-2.5" : "right-1.5";
  const iconSizeCls = isLg ? "w-4 h-4" : "w-3.5 h-3.5";
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<Date | undefined>(undefined);
  const [draftTime, setDraftTime] = useState<string>("00:00:00");
  // 인라인 직접입력 — 숫자만 보관(외부 value 변경 시 동기화). 마스크로 표시.
  const inputTemplate = maskTemplate(withTime, precision);
  const inputMaxDigits = maxDigitsFor(withTime, precision);
  const [digits, setDigits] = useState<string>(() => digitsFromValue(value));
  useEffect(() => {
    setDigits(digitsFromValue(value));
  }, [value]);
  const maskedText = maskDigits(digits, inputTemplate);
  const maskRemaining = inputTemplate.slice(maskedText.length);
  const [viewMonth, setViewMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "month">("day");
  // 데이트피커(day) 위에서 휠 스크롤 → 이전/다음 달 이동. 한 제스처의 연속 이벤트는 스로틀.
  const wheelTsRef = useRef(0);
  const onCalendarWheel = (e: React.WheelEvent) => {
    if (e.timeStamp - wheelTsRef.current < 120) return;
    wheelTsRef.current = e.timeStamp;
    setViewMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + (e.deltaY > 0 ? 1 : -1));
      return d;
    });
  };

  // 팝오버가 열릴 때마다 현재 value 로 초기화
  useEffect(() => {
    if (!open) return;
    const { date, time } = parseValue(value, withTime, precision);
    setDraftDate(date);
    setDraftTime(time);
    setViewMonth(date ?? new Date());
    setViewMode("day");
  }, [open, value, withTime, precision]);

  // precision 별 draftDate → 저장 문자열
  const formatResult = (d: Date) =>
    precision === "year"
      ? format(d, "yyyy")
      : precision === "month"
        ? format(d, "yyyy-MM")
        : withTime
          ? `${format(d, "yyyy-MM-dd")}T${draftTime || "00:00:00"}`
          : format(d, "yyyy-MM-dd");

  const handleToday = () => {
    onChange(formatResult(new Date()));
    setOpen(false);
  };

  // 달력/연/월 선택 — 항상 즉시 적용(확인 불필요). 날짜 단위면 닫고, 일시는 시간 입력 위해 열어둠.
  const handleSelectDate = (d?: Date) => {
    setDraftDate(d);
    if (d) {
      onChange(formatResult(d));
      if (!withTime) setOpen(false);
    }
  };

  // 숫자만 허용 + 자리별 범위 검증(월/일/시/분/초)
  const handleInputChange = (raw: string) => {
    setDigits(sanitizeDateDigits(raw, withTime, precision, inputMaxDigits));
  };

  // 직접 입력 커밋 — 빈값이면(비필수) 클리어, 완성·유효하면 적용, 그 외 원복.
  const commitInput = () => {
    if (digits.length === 0) {
      if (allowClear) onChange("");
      else setDigits(digitsFromValue(value));
      return;
    }
    if (digits.length === inputMaxDigits) {
      const parsed = parseInput(maskedText, withTime, precision);
      if (parsed !== null) {
        onChange(parsed);
        return;
      }
    }
    setDigits(digitsFromValue(value)); // 미완성/무효 → 원복
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {!iconOnly ? (
        // 숫자 직접입력(YYYY-MM-DD 마스크) + 달력아이콘(팝오버 트리거)
        <div className="relative w-full min-w-0">
          {/* 마스크 오버레이 — 입력한 부분은 자리만 차지(투명), 미입력 자리는 회색 placeholder */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center leading-none tracking-tight",
              overlaySizeCls,
            )}
          >
            <span className="invisible whitespace-pre">{maskedText}</span>
            <span className="text-muted-foreground whitespace-pre">
              {maskRemaining}
            </span>
          </div>
          <input
            id={id}
            type="text"
            inputMode="numeric"
            value={maskedText}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={commitInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitInput();
              }
            }}
            className={cn(
              "w-full leading-none tracking-tight border outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              inputSizeCls,
              className,
            )}
          />
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="날짜 선택"
              className={cn(
                "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[rgb(var(--primary))] transition-colors",
                iconPosCls,
              )}
            >
              <CalendarIcon className={iconSizeCls} strokeWidth={1.75} />
            </button>
          </PopoverTrigger>
        </div>
      ) : (
        // iconOnly: 그리드 셀 등 — 값 텍스트는 외부 렌더, 달력 아이콘만 노출
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            className={cn(
              "h-5 w-5 p-0 flex items-center justify-center rounded text-muted-foreground hover:text-[rgb(var(--primary))] transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              className,
            )}
            aria-label="날짜 선택"
          >
            <CalendarIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </PopoverTrigger>
      )}

      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        {precision === "year" ? (
          <YearPicker
            initialYear={(draftDate ?? new Date()).getFullYear()}
            selectedYear={draftDate?.getFullYear()}
            onSelect={(y) => handleSelectDate(new Date(y, 0, 1))}
          />
        ) : precision === "month" ? (
          <MonthYearPicker
            initialYear={(draftDate ?? viewMonth).getFullYear()}
            currentYear={draftDate?.getFullYear() ?? -1}
            currentMonth={draftDate?.getMonth() ?? -1}
            onSelect={(y, m) => handleSelectDate(new Date(y, m, 1))}
          />
        ) : viewMode === "day" ? (
          <div onWheel={onCalendarWheel}>
          <Calendar
            mode="single"
            selected={draftDate}
            onSelect={handleSelectDate}
            month={viewMonth}
            onMonthChange={setViewMonth}
            locale={ko}
            formatters={{
              formatCaption: (date) =>
                `${date.getMonth() + 1}월 ${date.getFullYear()}`,
            }}
            classNames={{
              // 선택된 날짜 셀 배경: accent → primary
              cell: cn(
                "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                "[&:has([aria-selected])]:bg-[rgb(var(--primary))]",
                "[&:has([aria-selected])]:text-primary-foreground",
                "[&:has([aria-selected])]:rounded-md",
              ),
            }}
            components={{
              CaptionLabel: ({ displayMonth }) => (
                <button
                  type="button"
                  onClick={() => setViewMode("month")}
                  className="text-sm font-medium px-2 py-0.5 rounded hover:bg-accent transition-colors"
                >
                  {displayMonth.getMonth() + 1}월 {displayMonth.getFullYear()}
                </button>
              ),
              IconLeft: ({ className }) => (
                <ChevronLeft className={cn("size-4", className)} />
              ),
              IconRight: ({ className }) => (
                <ChevronRight className={cn("size-4", className)} />
              ),
            }}
            showOutsideDays
          />
          </div>
        ) : (
          <MonthYearPicker
            initialYear={viewMonth.getFullYear()}
            currentYear={viewMonth.getFullYear()}
            currentMonth={viewMonth.getMonth()}
            onSelect={(y, m) => {
              setViewMonth(new Date(y, m, 1));
              setViewMode("day");
            }}
          />
        )}

        {/* 오늘 버튼 (day precision 의 day 모드에서만) */}
        {precision === "day" && viewMode === "day" && (
          <div className="flex justify-center pb-1.5">
            <button
              type="button"
              onClick={handleToday}
              className="h-6 px-3 text-[11px] border border-input rounded bg-background hover:bg-accent"
            >
              오늘
            </button>
          </div>
        )}

        {/* 시간 입력 (withTime) */}
        {withTime && (
          <div className="px-3 py-2 border-t border-border flex items-center">
            <Input
              type="time"
              step={1}
              value={draftTime}
              onChange={(e) => {
                const t = e.target.value;
                setDraftTime(t);
                // 날짜가 선택돼 있으면 시간 변경도 즉시 적용
                if (draftDate) {
                  onChange(
                    `${format(draftDate, "yyyy-MM-dd")}T${t || "00:00:00"}`,
                  );
                }
              }}
              lang="ko-KR-u-hc-h23"
              className="h-7 flex-1 text-[11px] pl-2 pr-1 dark:[color-scheme:dark]"
            />
          </div>
        )}

      </PopoverContent>
    </Popover>
  );
}
