// src/auth/RouteGuards.tsx
"use client";

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthed } from "@/app/services/auth/auth";

// 로그인 필요 페이지 가드 (ex: /)
export function RequireAuth() {
  const loc = useLocation();
  if (!isAuthed()) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return <Outlet />;
}

// 로그인 페이지 가드 (ex: /login)
// 이미 로그인 되어있으면 홈으로 보내기
export function OnlyGuest() {
  if (isAuthed()) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
