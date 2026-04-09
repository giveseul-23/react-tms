// ── 셀렉트 필드 ──────────────────────────────────────────────────────
export default function FormSelect({
  label,
  required,
  value,
  options,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  options: { value: string; label: string }[];
  onChange?: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-muted-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <select
        className="h-8 rounded-md border border-input bg-input-background px-2 text-xs outline-none focus:border-ring focus:ring-ring/50 focus:ring-[3px] cursor-pointer"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
