"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeColor = "BLUE" | "GREEN" | "RED" | "ORANGE" | "YELLOW" | "WINE" | "CUSTOM";

type ThemeSettings = {
  themeColor: ThemeColor;
  darkMode: boolean;
  customColor?: string; // hex e.g. "#FF6600"
};

type ThemeContextType = {
  darkMode: boolean;
  themeColor: ThemeColor;
  customColor?: string;
  setDarkMode: (v: boolean) => void;
  setThemeColor: (v: ThemeColor) => void;
  applySettings: (settings: ThemeSettings) => void;
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

/** hex → "R G B" 공백 구분 문자열 */
function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** 85 % 밝기 hover 색 계산 */
function hexToHoverRgb(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  const r = Math.round(((n >> 16) & 255) * 0.85);
  const g = Math.round(((n >> 8) & 255) * 0.85);
  const b = Math.round((n & 255) * 0.85);
  return `${r} ${g} ${b}`;
}

function applyCustomCssVars(hex: string) {
  const root = document.documentElement;
  const rgb = hexToRgb(hex);
  const hoverRgb = hexToHoverRgb(hex);
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const soft = `rgba(${r}, ${g}, ${b}, 0.12)`;

  root.style.setProperty("--primary", rgb);
  root.style.setProperty("--primary-hover", hoverRgb);
  root.style.setProperty("--primary-soft", soft);
  root.style.setProperty("--grid-header-bg", soft);
}

function clearCustomCssVars() {
  const root = document.documentElement;
  root.style.removeProperty("--primary");
  root.style.removeProperty("--primary-hover");
  root.style.removeProperty("--primary-soft");
  root.style.removeProperty("--grid-header-bg");
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return loadSettings().darkMode;
  });
  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    if (typeof window === "undefined") return "BLUE";
    return loadSettings().themeColor;
  });
  const [customColor, setCustomColorState] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return loadSettings().customColor;
  });

  const setDarkMode = (v: boolean) => {
    setDarkModeState(v);
    saveSettings({ themeColor, darkMode: v, customColor });
  };

  const setThemeColor = (v: ThemeColor) => {
    setThemeColorState(v);
    saveSettings({ themeColor: v, darkMode, customColor });
  };

  const applySettings = (settings: ThemeSettings) => {
    setThemeColorState(settings.themeColor);
    setDarkModeState(settings.darkMode);
    setCustomColorState(settings.customColor);
    saveSettings(settings);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);

    if (themeColor === "CUSTOM" && customColor) {
      root.setAttribute("data-theme", "CUSTOM");
      applyCustomCssVars(customColor);
    } else {
      clearCustomCssVars();
      root.setAttribute("data-theme", themeColor);
    }
  }, [darkMode, themeColor, customColor]);

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        themeColor,
        customColor,
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
