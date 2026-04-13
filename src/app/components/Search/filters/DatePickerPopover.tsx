"use client";
// ────────────────────────────────────────────────────────────
// 공통 Date / Datetime Picker 팝오버
//   - withTime=false → YYYY-MM-DD 선택만
//   - withTime=true  → YYYY-MM-DDTHH:MM:SS 선택 (시간 스피너 포함)
//   - [오늘] 버튼으로 오늘 날짜로 리셋
//   - [확인] / [취소] 버튼으로 적용/닫기
// ────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
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
                  ? "bg-primary text-primary-foreground border-primary"
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

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  withTime?: boolean;
  className?: string;
  placeholder?: string;
};

// value → { date, time } 분해
function parseValue(
  value: string,
  withTime: boolean,
): { date?: Date; time: string } {
  if (!value) return { time: "00:00:00" };
  if (withTime) {
    const [datePart, timeRaw = "00:00:00"] = value.split("T");
    const parsed = parse(datePart, "yyyy-MM-dd", new Date());
    const time =
      timeRaw.length === 5 ? `${timeRaw}:00` : timeRaw.slice(0, 8) || "00:00:00";
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
  className,
  placeholder,
}: Props) {
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<Date | undefined>(undefined);
  const [draftTime, setDraftTime] = useState<string>("00:00:00");
  const [viewMonth, setViewMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "month">("day");

  // 팝오버가 열릴 때마다 현재 value 로 초기화
  useEffect(() => {
    if (!open) return;
    const { date, time } = parseValue(value, withTime);
    setDraftDate(date);
    setDraftTime(time);
    setViewMonth(date ?? new Date());
    setViewMode("day");
  }, [open, value, withTime]);

  const display = formatDisplay(value, withTime);
  const placeholderText =
    placeholder ?? (withTime ? "YYYY-MM-DD HH:MM:SS" : "YYYY-MM-DD");

  const handleToday = () => {
    setDraftDate(new Date());
  };

  const handleCommit = () => {
    if (!draftDate) {
      setOpen(false);
      return;
    }
    const dateStr = format(draftDate, "yyyy-MM-dd");
    const result = withTime ? `${dateStr}T${draftTime || "00:00:00"}` : dateStr;
    onChange(result);
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
            "relative h-7 w-full pl-2 pr-6 text-left text-[11px] leading-none tracking-tight",
            "border border-input rounded-md bg-input-background",
            "flex items-center min-w-0",
            "hover:bg-accent/40 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            className,
          )}
        >
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
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        {viewMode === "day" ? (
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

        {/* 오늘 버튼 (day 모드에서만) */}
        {viewMode === "day" && (
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
