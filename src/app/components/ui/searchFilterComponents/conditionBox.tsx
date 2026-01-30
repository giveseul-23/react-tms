import {
  Equal,
  Percent,
  Parentheses,
  EqualNot,
  ChevronRight,
  ChevronLeft,
  ChevronLast,
  ChevronFirst,
  CircleSlash,
} from "lucide-react";
import { useState, useRef } from "react";

const ICON_OPTIONS = [
  { value: "equal", label: "완전일치", Icon: Equal },
  { value: "notEqual", label: "불일치", Icon: EqualNot },
  { value: "percent", label: "부분일치", Icon: Percent },
  { value: "parentheses", label: "포함", Icon: Parentheses },
  { value: "chevronRight", label: "초과", Icon: ChevronRight },
  { value: "chevronLeft", label: "미만", Icon: ChevronLeft },
  { value: "chevronLast", label: "이상", Icon: ChevronLast },
  { value: "chevronFirst", label: "이하", Icon: ChevronFirst },
  { value: "notUsed", label: "사용안함", Icon: CircleSlash },
];

export default function IconCombo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(ICON_OPTIONS[0]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      {/* 버튼 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          cursor-pointer
          rounded
          p-1
          text-[rgb(var(--fg))]
          hover:text-gray-700
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-blue-500
          focus-visible:ring-offset-2
        "
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={selected.label}
      >
        <selected.Icon className="w-4 h-4" />
      </button>

      {/* 드롭다운 */}
      {open && (
        <ul
          className="
            absolute z-10 mt-1
            min-w-max
            rounded-md
            border
            bg-[rgb(var(--bg))]
            shadow-lg
            py-1
          "
          role="listbox"
        >
          {ICON_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  setSelected(opt);
                  setOpen(false);
                }}
                className="
                  flex items-center
                  gap-2
                  w-full
                  px-3 py-2
                  text-sm
                  text-[rgb(var(--fg))]
                  hover:bg-gray-100
                  focus:bg-gray-100
                  focus:outline-none
                "
                role="option"
                aria-selected={selected.value === opt.value}
              >
                <opt.Icon className="w-4 h-4 text-[rgb(var(--fg))]" />
                <span>{opt.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
