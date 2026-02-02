import React from "react";
import ReactDOM, { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/app/context/ThemeContext";
import { PopupProvider } from "@/app/components/popup/PopupContext";

import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <PopupProvider>
        <App />
      </PopupProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
