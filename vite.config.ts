import { defineConfig, PluginOption } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// ──────────────────────────────────────────────────────────────────
// dev 전용: index.html 의 JSP 태그(<%= ServiceUtil.getSysConfigValue("X") %>)
// 를 아래 맵 값으로 치환해, Vite dev 서버에서도 운영(JSP)과 동일하게
// window.__SYS_CONFIG__ 가 채워지도록 한다.
//
// 빌드 결과물에는 JSP 태그를 그대로 남긴다 (운영 WAS 의 JSP 가 처리).
// ──────────────────────────────────────────────────────────────────
const DEV_SYS_CONFIG: Record<string, string> = {
  TMAP_API_KEY: "fxsbd1u5GO4n6n9SksN3v7mbPMEXbBqF5M6swlDl",
};

function jspDevMockPlugin(): PluginOption {
  return {
    name: "jsp-dev-mock-sysconfig",
    apply: "serve", // dev 서버에서만 적용 (build 시 그대로 두기)
    transformIndexHtml(html) {
      return html.replace(
        /<%=\s*ServiceUtil\.getSysConfigValue\(\s*\\?"([^"\\]+)\\?"\s*\)\s*%>/g,
        (_match, key) => DEV_SYS_CONFIG[key] ?? "",
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), jspDevMockPlugin()],
  server: {
    proxy: {
      "/api": {
        target: "http://192.168.0.34:9090",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
