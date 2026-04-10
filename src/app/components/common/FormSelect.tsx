import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

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
      <Select value={value ?? ""} onValueChange={(v) => onChange?.(v)}>
        <SelectTrigger className="h-8 px-2 text-xs [&>svg]:h-3 [&>svg]:w-3">
          <SelectValue placeholder="선택" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
