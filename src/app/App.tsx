// src/App.tsx
"use client";

import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import LoginRoutePage from "@/pages/LoginPage";
import { RequireAuth, OnlyGuest } from "@/app/services/auth/RouteGuards";
import { Lang } from "@/app/services/common/Lang";

export default function App() {
  useEffect(() => {
    // 요구사항 6: 앱 시작 시 localStorage 캐시에서 언어팩 복원
    // 새로고침해도 서버 재요청 없이 즉시 Lang.get() 사용 가능
    const restored = Lang.restoreFromCache();
    if (restored) {
      console.log("[App] Lang 캐시 복원 완료");
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 안한 사용자만 접근 */}
        <Route element={<OnlyGuest />}>
          <Route path="/login" element={<LoginRoutePage />} />
        </Route>

        {/* 로그인 필요 */}
        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* 없는 경로는 홈으로 */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
