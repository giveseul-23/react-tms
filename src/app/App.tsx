// src/App.tsx
"use client";

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import LoginRoutePage from "@/pages/LoginPage";
import { RequireAuth, OnlyGuest } from "@/app/services/auth/RouteGuards";

export default function App() {
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
