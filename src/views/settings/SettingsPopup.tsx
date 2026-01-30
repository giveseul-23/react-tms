import React, { useState } from "react";
import { useTheme } from "@/app/context/ThemeContext";
import { User, Lock, Settings, Palette, Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

const categoryCntryOptions = [
  { value: "전체", label: "전체" },
  { value: "대한민국", label: "대한민국" },
];

const categoryTabCntOptions = [
  { value: "전체", label: "전체" },
  { value: "20", label: "20" },
];

const themeOptions = [
  { value: "BLUE", color: "bg-blue-500", label: "파랑" },
  { value: "GREEN", color: "bg-green-500", label: "초록" },
  { value: "RED", color: "bg-red-500", label: "빨강" },
  { value: "ORANGE", color: "bg-orange-500", label: "주황" },
  { value: "YELLOW", color: "bg-yellow-400", label: "노랑" },
];

type ThemePickerProps = {
  value: string;
  onChange: (value: string) => void;
};

const ThemePicker = ({ value, onChange }: ThemePickerProps) => {
  return (
    <div role="radiogroup" className="flex items-center gap-3">
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
              h-6 w-6 rounded-full
              ${opt.color}
              transition-all
              ${
                isSelected
                  ? "ring-2 ring-blue-500 ring-offset-2 scale-110"
                  : "hover:scale-105"
              }
            `}
          />
        );
      })}
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
}: ToggleSwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => !disabled && onChange(!value)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors
        ${value ? "bg-blue-600" : "bg-gray-300"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span
        className={`
          inline-block h-5 w-5 transform rounded-full bg-white shadow
          transition-transform
          ${value ? "translate-x-5" : "translate-x-1"}
        `}
      />
    </button>
  );
};

/* =======================
 * SettingsPopup
 * ======================= */
export const SettingsPopup: React.FC = () => {
  const { darkMode, setDarkMode, themeColor, setThemeColor } = useTheme();

  const [userId, setUserId] = useState("daseul.ju");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [locale, setLocale] = useState("대한민국");

  const [autoLogin, setAutoLogin] = useState(true);

  return (
    <div className="w-full">
      <form className="space-y-8">
        {/* 사용자 정보 */}
        <Section
          icon={<User />}
          title="사용자 정보"
          fields={[
            {
              label: "사용자명",
              render: () => (
                <Input value="주다슬" readOnly className="bg-gray-50" />
              ),
            },
            {
              label: "사용자 아이디",
              render: () => (
                <Input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              ),
            },
            {
              label: "로컬",
              render: () => (
                <div className="flex items-center gap-2">
                  <Select onValueChange={(e) => setLocale(e.target.value)}>
                    <SelectTrigger id={""}>
                      <SelectValue placeholder={""} />
                    </SelectTrigger>

                    <SelectContent>
                      {categoryCntryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ),
            },
          ]}
        />

        {/* 비밀번호 */}
        <Section
          icon={<Lock />}
          title="비밀번호"
          fields={[
            {
              label: "현재 비밀번호",
              render: () => (
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              ),
            },
            {
              label: "새 비밀번호",
              render: () => (
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              ),
            },
            {
              label: "새 비밀번호 확인",
              render: () => (
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              ),
            },
          ]}
        />

        {/* 최대 탭 개수
        <Section
          icon={<Settings />}
          title="최대 탭 개수 설정"
          fields={[
            {
              label: "사용자설정값",
              render: () => (
                <select
                  value={userSetting}
                  onChange={(e) => setUserSetting(e.target.value)}
                  className="input"
                >
                  {[10, 20, 30, 40, 50].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              ),
            },
            {
              label: "시스템설정값",
              render: () => (
                <Input
                  value={systemSetting}
                  onChange={(e) => setSystemSetting(e.target.value)}
                />
              ),
            },
          ]}
        /> */}

        {/* 기타 */}
        <Section
          icon={<Palette />}
          title="기타"
          fields={[
            {
              label: "테마",
              render: () => (
                <ThemePicker value={themeColor} onChange={setThemeColor} />
              ),
            },
            {
              label: "다크모드",
              render: () => (
                <ToggleSwitch value={darkMode} onChange={setDarkMode} />
              ),
            },
          ]}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button size="sm" variant="outline">
            취소
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-[rgb(var(--primary))] hover:bg-blue-700"
          >
            적용
          </Button>
        </div>
      </form>
    </div>
  );
};

/* =======================
 * Section
 * ======================= */
type SectionProps = {
  icon: React.ReactNode;
  title: string;
  fields: {
    label: string;
    render: () => React.ReactNode;
  }[];
};

const Section = ({ icon, title, fields }: SectionProps) => (
  <section>
    <div className="flex items-center gap-2 mb-4">
      <span className="text-[rgb(var(--fg))]">{icon}</span>
      <h3 className="text-lg font-semibold text-[rgb(var(--fg))]">{title}</h3>
    </div>

    <div className="space-y-4">
      {fields.map((f) => (
        <FormRow key={f.label} label={f.label}>
          {f.render()}
        </FormRow>
      ))}
    </div>
  </section>
);

/* =======================
 * FormRow
 * ======================= */
const FormRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
    <span className="text-sm font-medium text-[rgb(var(--fg))] whitespace-nowrap">
      {label}
    </span>
    <div className="w-full">{children}</div>
  </div>
);
