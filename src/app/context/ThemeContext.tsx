import { createContext, useContext, useEffect, useState } from "react";

type ThemeColor = "BLUE" | "GREEN" | "RED" | "ORANGE" | "YELLOW";

type ThemeContextType = {
  darkMode: boolean;
  themeColor: ThemeColor;
  setDarkMode: (v: boolean) => void;
  setThemeColor: (v: ThemeColor) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState<ThemeColor>("BLUE");

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("dark", darkMode);
    root.setAttribute("data-theme", themeColor);
  }, [darkMode, themeColor]);

  return (
    <ThemeContext.Provider
      value={{ darkMode, themeColor, setDarkMode, setThemeColor }}
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
