import React, { useState, useRef } from "react";
import { useTheme, type ThemeColor } from "@/app/context/ThemeContext";
import { User, Lock, Palette, Save, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { usePopup } from "@/app/components/popup/PopupContext";
import { getUserId, getUserName } from "@/app/services/auth/auth";

// ThemeColor는 ThemeContext에서 import

const categoryCntryOptions = [
  { value: "전체", label: "전체" },
  { value: "대한민국", label: "대한민국" },
];

const themeOptions: { value: ThemeColor; color: string; label: string }[] = [
  { value: "BLUE", color: "bg-blue-500", label: "파랑" },
  { value: "GREEN", color: "bg-green-500", label: "초록" },
  { value: "RED", color: "bg-red-500", label: "빨강" },
  { value: "ORANGE", color: "bg-orange-500", label: "주황" },
  { value: "YELLOW", color: "bg-yellow-400", label: "노랑" },
  { value: "WINE", color: "bg-[#800020]", label: "와인" },
  { value: "GS", color: "bg-[#009999]", label: "GS" },
];

type ThemePickerProps = {
  value: ThemeColor;
  customColor?: string;
  onChange: (value: ThemeColor, customHex?: string) => void;
};

const ThemePicker = ({ value, customColor, onChange }: ThemePickerProps) => {
  const colorInputRef = useRef<HTMLInputElement>(null);

  return (
    <div role="radiogroup" className="flex items-center gap-2.5">
      {themeOptions.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            title={opt.label}
            onClick={() => onChange(opt.value)}
            className={`
              h-5 w-5 rounded-full transition-all
              ${opt.color}
              ${
                isSelected
                  ? "ring-2 ring-offset-1 ring-blue-500 scale-110"
                  : "hover:scale-105 opacity-70 hover:opacity-100"
              }
            `}
          />
        );
      })}

      {/* 커스텀 컬러 피커 */}
      <div className="relative">
        <button
          type="button"
          role="radio"
          aria-checked={value === "CUSTOM"}
          title="커스텀 색상"
          onClick={() => colorInputRef.current?.click()}
          className={`
            h-5 w-5 rounded-full transition-all border border-dashed border-slate-300 dark:border-slate-500
            flex items-center justify-center overflow-hidden
            ${
              value === "CUSTOM"
                ? "ring-2 ring-offset-1 ring-blue-500 scale-110"
                : "hover:scale-105 opacity-70 hover:opacity-100"
            }
          `}
          style={
            value === "CUSTOM" && customColor
              ? { backgroundColor: customColor, borderStyle: "solid" }
              : undefined
          }
        >
          {!(value === "CUSTOM" && customColor) && (
            <span className="text-[10px] leading-none text-slate-400">+</span>
          )}
        </button>
        <input
          ref={colorInputRef}
          type="color"
          value={customColor ?? "#6366f1"}
          onChange={(e) => onChange("CUSTOM", e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

type ToggleSwitchProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

const ToggleSwitch = ({
  value,
  onChange,
  disabled = false,
}: ToggleSwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={value}
    disabled={disabled}
    onClick={() => !disabled && onChange(!value)}
    className={`
      relative inline-flex h-5 w-9 items-center rounded-full transition-colors
      ${value ? "bg-blue-600" : "bg-gray-200"}
      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    `}
  >
    <span
      className={`
        inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
        ${value ? "translate-x-4" : "translate-x-0.5"}
      `}
    />
  </button>
);

/* =======================
 * SettingsPopup
 * ======================= */
export const SettingsPopup: React.FC = () => {
  const { darkMode, themeColor, customColor, applySettings } = useTheme();

  const [draft, setDraft] = useState<{
    userNm: string;
    userId: string;
    locale: string;
    themeColor: ThemeColor;
    darkMode: boolean;
    customColor?: string;
  }>({
    userNm: getUserName(),
    userId: getUserId(),
    locale: "대한민국",
    themeColor,
    darkMode,
    customColor,
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { closePopup } = usePopup();

  const setDraftField = <K extends keyof typeof draft>(
    key: K,
    value: (typeof draft)[K],
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  const handleThemeChange = (color: ThemeColor, customHex?: string) => {
    setDraft((prev) => ({
      ...prev,
      themeColor: color,
      customColor:
        color === "CUSTOM" ? (customHex ?? prev.customColor) : prev.customColor,
    }));
  };

  const handleApply = () => {
    applySettings({
      themeColor: draft.themeColor,
      darkMode: draft.darkMode,
      customColor: draft.customColor,
    });
    closePopup();
  };

  const handleCancel = () => {
    setDraft({
      userNm: draft.userNm,
      userId: draft.userId,
      locale: "대한민국",
      themeColor,
      darkMode,
      customColor,
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ── 사용자 정보 ── */}
      <SectionBlock icon={<User className="w-3.5 h-3.5" />} title="사용자 정보">
        <FieldRow label="사용자명">
          <Input
            value={draft.userNm}
            readOnly
            className="h-7 text-xs
              bg-slate-50 dark:bg-slate-700
              border-slate-200 dark:border-slate-600
              text-slate-500 dark:text-slate-400
              cursor-default"
          />
        </FieldRow>
        <FieldRow label="아이디">
          <Input
            value={draft.userId}
            onChange={(e) => setDraftField("userId", e.target.value)}
            className="h-7 text-xs
              bg-white dark:bg-slate-800
              border-slate-200 dark:border-slate-600
              text-slate-700 dark:text-slate-100"
          />
        </FieldRow>
        <FieldRow label="로컬">
          <Select
            value={draft.locale}
            onValueChange={(v) => setDraftField("locale", v)}
          >
            <SelectTrigger
              className="h-7 text-xs
                bg-white dark:bg-slate-800
                border-slate-200 dark:border-slate-600
                text-slate-700 dark:text-slate-100"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryCntryOptions.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
      </SectionBlock>

      {/* ── 비밀번호 ── */}
      <SectionBlock icon={<Lock className="w-3.5 h-3.5" />} title="비밀번호">
        <FieldRow label="현재 비밀번호">
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="현재 비밀번호 입력"
            className="h-7 text-xs
              bg-white dark:bg-slate-800
              border-slate-200 dark:border-slate-600
              text-slate-700 dark:text-slate-100
              placeholder:text-slate-300 dark:placeholder:text-slate-500"
          />
        </FieldRow>
        <FieldRow label="새 비밀번호">
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호 입력"
            className="h-7 text-xs
              bg-white dark:bg-slate-800
              border-slate-200 dark:border-slate-600
              text-slate-700 dark:text-slate-100
              placeholder:text-slate-300 dark:placeholder:text-slate-500"
          />
        </FieldRow>
        <FieldRow label="비밀번호 확인">
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="새 비밀번호 재입력"
            className="h-7 text-xs
              bg-white dark:bg-slate-800
              border-slate-200 dark:border-slate-600
              text-slate-700 dark:text-slate-100
              placeholder:text-slate-300 dark:placeholder:text-slate-500"
          />
        </FieldRow>
      </SectionBlock>

      {/* ── 테마 / 기타 ── */}
      <SectionBlock
        icon={<Palette className="w-3.5 h-3.5" />}
        title="화면 설정"
      >
        <FieldRow label="테마 색상">
          <ThemePicker
            value={draft.themeColor}
            customColor={draft.customColor}
            onChange={handleThemeChange}
          />
        </FieldRow>
        <FieldRow label="다크모드">
          <ToggleSwitch
            value={draft.darkMode}
            onChange={(v) => setDraftField("darkMode", v)}
          />
        </FieldRow>
      </SectionBlock>

      {/* ── 버튼 ── */}
      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
        <Button
          size="sm"
          variant="outline"
          onClick={closePopup}
          className="h-7 px-4 text-xs
            border-slate-200 dark:border-slate-600
            text-slate-500 dark:text-slate-300
            hover:bg-slate-50 dark:hover:bg-slate-700
            gap-1.5"
        >
          <X className="w-3 h-3" />
          취소
        </Button>
        <Button
          size="sm"
          onClick={handleApply}
          className="h-7 px-4 text-xs font-semibold text-white gap-1.5 hover:bg-[rgb(var(--primary-hover))] bg-[rgb(var(--primary))]"
        >
          <Save className="w-3 h-3" />
          적용
        </Button>
      </div>
    </div>
  );
};

/* =======================
 * SectionBlock
 * ======================= */
type SectionBlockProps = {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
};

const SectionBlock = ({ icon, title, children }: SectionBlockProps) => (
  <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
    {/* 헤더 - primary 색상 유지 */}
    <div className="flex items-center gap-1.5 px-3 py-2 bg-[rgb(var(--primary))]">
      <span className="text-white/80">{icon}</span>
      <span className="text-[12px] font-semibold text-white tracking-widest uppercase leading-none">
        {title}
      </span>
    </div>
    <div className="divide-y divide-slate-100 dark:divide-slate-700">
      {children}
    </div>
  </div>
);

/* =======================
 * FieldRow
 * ======================= */
const FieldRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div
    className="grid grid-cols-[110px_1fr] items-center gap-3 px-3 py-2
    bg-white dark:bg-slate-800
    hover:bg-blue-50/40 dark:hover:bg-slate-700/60
    transition-colors group"
  >
    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 whitespace-nowrap">
      {label}
    </span>
    <div className="w-full">{children}</div>
  </div>
);
