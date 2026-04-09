// ── 폼 입력 필드 ──────────────────────────────────────────────────────
export default function FormInput({
  label,
  required,
  value,
  onChange,
  readOnly,
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-muted-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <input
        className={`h-8 rounded-md border border-input px-2.5 text-xs outline-none focus:border-ring focus:ring-ring/50 focus:ring-[3px] ${
          readOnly
            ? "bg-muted text-muted-foreground cursor-default"
            : "bg-input-background"
        }`}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
      />
    </div>
  );
}
