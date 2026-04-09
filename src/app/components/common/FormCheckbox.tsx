// ── 체크박스 필드 ────────────────────────────────────────────────────
export default function FormCheckbox({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-muted-foreground">{label}</label>
      <div className="flex items-center h-8">
        <input
          type="checkbox"
          className="w-3.5 h-3.5 cursor-pointer accent-[rgb(var(--primary))]"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
