// ── 체크박스 필드 ────────────────────────────────────────────────────
export default function FormCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 h-8">
      <input
        type="checkbox"
        className="w-3.5 h-3.5 cursor-pointer accent-[rgb(var(--primary))]"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <label className="text-xs">{label}</label>
    </div>
  );
}
