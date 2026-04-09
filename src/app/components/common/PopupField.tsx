import { Search } from "lucide-react";

// ── 팝업 검색 필드 렌더러 ─────────────────────────────────────────────
export default function PopupField({
  label,
  required,
  codeValue,
  nameValue,
  nameLabel,
  onSearch,
  readOnly,
}: {
  label: string;
  required?: boolean;
  codeValue: string;
  nameValue?: string;
  nameLabel?: string;
  onSearch: () => void;
  readOnly?: boolean;
}) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-muted-foreground">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
        <div className="flex gap-1">
          <input
            className="flex-1 min-w-0 h-8 rounded-md border border-input bg-input-background px-2.5 text-xs outline-none focus:border-ring focus:ring-ring/50 focus:ring-[3px]"
            value={codeValue}
            readOnly
          />
          {!readOnly && (
            <button
              type="button"
              onClick={onSearch}
              className="shrink-0 w-7 h-8 border border-input rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {nameLabel !== undefined && (
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground">
            {nameLabel}
          </label>
          <input
            className="h-8 rounded-md border border-input bg-muted px-2.5 text-xs text-muted-foreground"
            value={nameValue ?? ""}
            readOnly
          />
        </div>
      )}
    </>
  );
}
