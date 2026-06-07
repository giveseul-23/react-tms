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

function formatDisplay(value: string, withTime: boolean): string {
  if (!value) return "";
  if (!withTime) return value;
  // "YYYY-MM-DDTHH:MM:SS" → "YYYY-MM-DD HH:MM:SS"
  return value.replace("T", " ");
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
}: Props) {
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<Date | undefined>(undefined);
  const [draftTime, setDraftTime] = useState<string>("00:00:00");
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

  const display = formatDisplay(value, withTime);
  const placeholderText =
    placeholder ??
    (precision === "year"
      ? "YYYY"
      : precision === "month"
        ? "YYYY-MM"
        : withTime
          ? "YYYY-MM-DD HH:MM:SS"
          : "YYYY-MM-DD");

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

  const handleCommit = () => {
    if (!draftDate) {
      setOpen(false);
      return;
    }
    onChange(formatResult(draftDate));
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          className={cn(
            iconOnly
              ? "h-5 w-5 p-0 flex items-center justify-center rounded text-muted-foreground hover:text-[rgb(var(--primary))] transition-colors"
              : "relative h-7 w-full pl-2 pr-6 text-left text-[11px] leading-none tracking-tight border border-input rounded-md bg-input-background flex items-center min-w-0 hover:bg-accent/40 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            className,
          )}
          aria-label={iconOnly ? "날짜 선택" : undefined}
        >
          {iconOnly ? (
            <CalendarIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
          ) : (
            <>
              <span
                className={cn(
                  "truncate",
                  !display && "text-muted-foreground font-normal",
                )}
              >
                {display || placeholderText}
              </span>
              <CalendarIcon
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
                strokeWidth={1.75}
              />
            </>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        {precision === "year" ? (
          <YearPicker
            initialYear={(draftDate ?? new Date()).getFullYear()}
            selectedYear={draftDate?.getFullYear()}
            onSelect={(y) => setDraftDate(new Date(y, 0, 1))}
          />
        ) : precision === "month" ? (
          <MonthYearPicker
            initialYear={(draftDate ?? viewMonth).getFullYear()}
            currentYear={draftDate?.getFullYear() ?? -1}
            currentMonth={draftDate?.getMonth() ?? -1}
            onSelect={(y, m) => setDraftDate(new Date(y, m, 1))}
          />
        ) : viewMode === "day" ? (
          <div onWheel={onCalendarWheel}>
          <Calendar
            mode="single"
            selected={draftDate}
            onSelect={setDraftDate}
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
              onChange={(e) => setDraftTime(e.target.value)}
              lang="ko-KR-u-hc-h23"
              className="h-7 flex-1 text-[11px] pl-2 pr-1 dark:[color-scheme:dark]"
            />
          </div>
        )}

        {/* 확인 / 취소 */}
        <div
          className={cn(
            "flex gap-1 px-3 pb-3",
            !withTime && "pt-2 border-t border-border",
          )}
        >
          <button
            type="button"
            onClick={handleCommit}
            className="flex-1 h-7 text-[11px] rounded text-white"
            style={{ backgroundColor: "rgb(var(--primary))" }}
          >
            확인
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 h-7 text-[11px] rounded border border-input bg-background hover:bg-accent"
          >
            취소
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
