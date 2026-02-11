// AuthPage.tsx
"use client";

import React, { useState } from "react";
import loginBgImg from "@/assets/logistics_img4.png";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/app/services/auth/authApi";
import { setTokens } from "@/app/services/auth/auth"; // ✅ 여기 setToken 사용

type FormState = { userId: string; password: string };

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    userId: "",
    password: "",
  });

  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const res = await authApi.loginMobile({
        userId: form.userId,
        password: form.password,
      });

      const { ACCESS_TOKEN, REFRESH_TOKEN, userId, userNm, userLang } =
        res.data.data;

      if (ACCESS_TOKEN == null || ACCESS_TOKEN === undefined) {
        alert("NOT VALID");
        return;
      }

      setTokens(ACCESS_TOKEN, REFRESH_TOKEN, userId, userNm, userLang);

      navigate("/", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      {/* ✅ 2컬럼 레이아웃: 왼쪽(이미지) / 오른쪽(폼) */}
      <div className="h-full w-full flex">
        {/* ✅ 이미지 칸 */}
        <div className="relative flex-1 min-w-0">
          <img
            src={loginBgImg}
            alt="Auth Visual"
            className="h-full w-full object-cover"
          />
        </div>

        {/* ✅ 로그인 칸: 흰색 고정 */}
        <div className="w-full md:w-[42%] lg:w-[38%] bg-white border-l border-slate-200">
          <div className="h-full flex items-center">
            <div className="w-full px-10 py-12 md:px-12 lg:px-14">
              <div className="max-w-sm">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Sign in
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-500 whitespace-pre-line">
                  Welcome back.
                  {"\n"}Sign in to continue.
                </p>

                <form onSubmit={onSubmit} className="mt-10 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500">
                      ID
                    </label>
                    <input
                      type="text"
                      value={form.userId}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, userId: e.target.value }))
                      }
                      className={cn(
                        "w-full rounded-md border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900",
                        "placeholder:text-slate-400 outline-none",
                        "focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100",
                      )}
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500">
                      Password
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, password: e.target.value }))
                      }
                      className={cn(
                        "w-full rounded-md border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900",
                        "placeholder:text-slate-400 outline-none",
                        "focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100",
                      )}
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  {/* ✅ Sign In 버튼 */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      "w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white",
                      "hover:bg-blue-700 transition-colors",
                      "disabled:opacity-60 disabled:cursor-not-allowed",
                    )}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* ✅ 오른쪽 */}
      </div>
    </div>
  );
}
