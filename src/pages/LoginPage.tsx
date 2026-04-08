// AuthPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import loginBgImg from "@/assets/logistics_img3.png";
import { useNavigate } from "react-router-dom";
import { authApi, getConfigInfo } from "@/app/services/auth/authApi";
import { setTokens } from "@/app/services/auth/auth";
import { Util } from "@/app/services/common/Util.ts";
import { ErrorPopup } from "@/app/components/popup/ErrorPopup";

type FormState = { userId: string; password: string };

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [errorPopup, setErrorPopup] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({
    open: false,
    title: "",
    message: "",
  });
  const [rememberUserId, setRememberUserId] = useState<boolean>(() => {
    return localStorage.getItem("rememberUserId") === "true";
  });
  const [form, setForm] = useState<FormState>(() => ({
    userId:
      localStorage.getItem("rememberUserId") === "true"
        ? (localStorage.getItem("savedUserId") ?? "")
        : "",
    password: "",
  }));

  const navigate = useNavigate();

  useEffect(() => {
    if (rememberUserId) {
      localStorage.setItem("rememberUserId", "true");
      localStorage.setItem("savedUserId", form.userId);
    } else {
      localStorage.removeItem("rememberUserId");
      localStorage.removeItem("savedUserId");
    }
  }, [rememberUserId]);

  const showError = (title: string, message: string) => {
    setErrorPopup({ open: true, title, message });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authApi.loginJwt({
        userId: form.userId,
        password: form.password,
      });

      if (res.data.success) {
        const {
          ACCESS_TOKEN,
          REFRESH_TOKEN,
          userId,
          userNm,
          userLang,
          userGroupName,
          userGroupCode,
        } = res.data.data;

        setTokens(
          ACCESS_TOKEN,
          REFRESH_TOKEN,
          userId,
          userNm,
          userLang,
          userGroupName,
        );

        Util.setUtilUserInfo({
          userNm,
          userLang,
          userGroupName,
          userGroupCode,
        });

        if (rememberUserId) {
          localStorage.setItem("savedUserId", form.userId);
        }

        await getConfigInfo();

        navigate("/", { replace: true });
      } else {
        showError("로그인 오류", res.data.msg);
      }
    } catch (err: any) {
      // 네트워크 단절 / 서버 미응답
      if (!err.response) {
        showError(
          "서버 연결 오류",
          "서버에 연결할 수 없습니다.\n네트워크 상태를 확인하거나 잠시 후 다시 시도해주세요.",
        );
      } else {
        // 서버 응답이 있지만 오류인 경우
        const serverMsg =
          err?.response?.data?.message ??
          err?.response?.data?.error?.message ??
          `서버 오류가 발생했습니다. (HTTP ${err?.response?.status})`;
        showError("로그인 오류", serverMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      {/* 오류 팝업 */}
      <ErrorPopup
        open={errorPopup.open}
        title={errorPopup.title}
        message={errorPopup.message}
        onClose={() => setErrorPopup((p) => ({ ...p, open: false }))}
      />

      <div className="h-full w-full flex">
        <div className="relative flex-1 min-w-0">
          <img
            src={loginBgImg}
            alt="Auth Visual"
            className="h-full w-full object-cover"
          />
        </div>

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

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberUserId}
                      onChange={(e) => setRememberUserId(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600">Remeber Me</span>
                  </label>

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
      </div>
    </div>
  );
}
