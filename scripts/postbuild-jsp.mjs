// scripts/postbuild-jsp.mjs
// ─────────────────────────────────────────────────────────────
// 빌드 후 dist/index.html → dist/index.jsp 변환
//   1. JSP 디렉티브(page import) 삽입
//   2. 파일명 변경 (index.html → index.jsp)
// ─────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const htmlPath = path.join(distDir, "index.html");
const jspPath = path.join(distDir, "index.jsp");

// ── ServiceUtil 패키지 경로 (프로젝트에 맞게 수정) ────────────
const JSP_DIRECTIVES = [
  '<%@ page contentType="text/html;charset=UTF-8" %>',
  '<%@ page import="com.hankook.tms.framework.core.util.ServiceUtil" %>',
].join("\n");

// ── 실행 ──────────────────────────────────────────────────────
if (!fs.existsSync(htmlPath)) {
  console.error("[postbuild-jsp] dist/index.html 이 없습니다. 먼저 빌드를 실행하세요.");
  process.exit(1);
}

let html = fs.readFileSync(htmlPath, "utf-8");

// JSP 디렉티브를 <!DOCTYPE html> 바로 위에 삽입
if (html.includes("<!DOCTYPE html>")) {
  html = html.replace("<!DOCTYPE html>", `${JSP_DIRECTIVES}\n<!DOCTYPE html>`);
} else {
  html = `${JSP_DIRECTIVES}\n${html}`;
}

// index.jsp 로 저장 (index.html 은 그대로 유지)
fs.writeFileSync(jspPath, html, "utf-8");

console.log("[postbuild-jsp] dist/index.jsp 생성 완료 (index.html 유지)");
