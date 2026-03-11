"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ThemeColor = "BLUE" | "GREEN" | "RED" | "ORANGE" | "YELLOW";

type ThemeSettings = {
  themeColor: ThemeColor;
  darkMode: boolean;
};

type ThemeContextType = {
  darkMode: boolean;
  themeColor: ThemeColor;
  setDarkMode: (v: boolean) => void;
  setThemeColor: (v: ThemeColor) => void;
  applySettings: (settings: ThemeSettings) => void; // 한번에 저장
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "app-theme-settings";

const loadSettings = (): ThemeSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { themeColor: "BLUE", darkMode: false };
};

const saveSettings = (settings: ThemeSettings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // typeof window 체크로 SSR 안전하게 + 초기값부터 바로 localStorage 읽기
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return loadSettings().darkMode;
  });
  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    if (typeof window === "undefined") return "BLUE";
    return loadSettings().themeColor;
  });

  // 개별 setter (단독으로 바꿀 일이 생길 때 대비)
  const setDarkMode = (v: boolean) => {
    setDarkModeState(v);
    saveSettings({ themeColor, darkMode: v });
  };

  const setThemeColor = (v: ThemeColor) => {
    setThemeColorState(v);
    saveSettings({ themeColor: v, darkMode });
  };

  // SettingsPopup에서 적용 버튼 클릭 시 한 번에 저장
  const applySettings = (settings: ThemeSettings) => {
    setThemeColorState(settings.themeColor);
    setDarkModeState(settings.darkMode);
    saveSettings(settings); // 한 번만 호출 → 클로저 문제 없음
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    root.setAttribute("data-theme", themeColor);
  }, [darkMode, themeColor]);

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        themeColor,
        setDarkMode,
        setThemeColor,
        applySettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
