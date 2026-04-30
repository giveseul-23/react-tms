// src/views/MenuConfig/popup/MenuFolderAddPopup.tsx
"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Search } from "lucide-react";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import type { MenuRow } from "../MenuConfig";

interface MenuFolderAddPopupProps {
  selectedRow: MenuRow | null;
  applOptions: { CODE: string; NAME: string }[];
  onConfirm: (data: FolderFormData) => void;
  onClose: () => void;
}

export type FolderFormData = {
  APPLCODE: string;
  MENUCODE: string;
  MSG_CD: string;
  MSG_DESC: string;
  PARANT_MENU_CD: string;
  SUPERMENUCODE: string;
  DSPLY_SEQ: number;
  USE_YN: "Y" | "N";
  LEAFYN: "N";
  URL: null;
};

export default function MenuFolderAddPopup({
  selectedRow,
  applOptions,
  onConfirm,
  onClose,
}: MenuFolderAddPopupProps) {
  const { openPopup, closePopup } = usePopup();

  // 상위 메뉴코드 — 가상루트(-1) 선택이면 최상위, 아니면 선택 행
  const parentMenuCode = selectedRow?.isVirtualRoot
    ? selectedRow.APPLCODE // 가상루트 선택 시 APPLCODE 를 상위로
    : (selectedRow?.MENUCODE ?? "");

  // 화면 표시용 레이블 — 코드 + 명칭
  const parentMenuLabel = selectedRow
    ? `${parentMenuCode}${selectedRow.MSG_DESC ? ` (${selectedRow.MSG_DESC})` : ""}`
    : parentMenuCode;

  const defaultAppl = selectedRow?.APPLCODE ?? applOptions[0]?.CODE ?? "";

  const [form, setForm] = useState({
    APPLCODE: defaultAppl,
    MENUCODE: "",
    MSG_CD: "",
    MSG_DESC: "",
    DSPLY_SEQ: "1",
    USE_YN: "Y" as "Y" | "N",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.APPLCODE) errs.APPLCODE = "응용프로그램을 선택하세요.";
    if (!form.MENUCODE) errs.MENUCODE = "메뉴코드를 입력하세요.";
    if (!form.MSG_CD) errs.MSG_CD = "다국어 키를 선택하세요.";
    if (!form.MSG_DESC) errs.MSG_DESC = "메뉴명을 입력하세요.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    onConfirm({
      ...form,
      PARANT_MENU_CD: parentMenuCode,
      SUPERMENUCODE: parentMenuCode,
      DSPLY_SEQ: Number(form.DSPLY_SEQ) || 1,
      LEAFYN: "N",
      URL: null,
    });
  };

  // 다국어키 팝업 — 선택 시 MSG_CD, MSG_DESC, MENUCODE 자동 세팅
  const openMsgCdPopup = () => {
    openPopup({
      title: "다국어 키 조회",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectMsgCodeName"
          onApply={(row: any) => {
            closePopup();
            if (!row) return;
            const code = row.CODE ?? row.MSG_CD ?? "";
            const name = row.NAME ?? row.MSG_DESC ?? "";
            setForm((p) => ({
              ...p,
              MSG_CD: code,
              MSG_DESC: name,
              // MENUCODE 도 자동 세팅 (수정 가능)
              MENUCODE: code,
            }));
          }}
          onClose={closePopup}
        />
      ),
    });
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* ── 상위 메뉴코드 (읽기전용 표시, 수정 불가) ── */}
      <Field label="상위 메뉴코드">
        <Input
          value={parentMenuLabel}
          readOnly
          className="h-8 text-sm bg-slate-100 cursor-not-allowed text-slate-600"
        />
      </Field>

      {/* ── 응용프로그램 ── */}
      <Field label="응용프로그램 *" error={errors.APPLCODE}>
        <div className="relative w-full">
          <select
            value={form.APPLCODE}
            onChange={set("APPLCODE")}
            className="w-full h-8 pl-2 pr-8 border border-slate-200 rounded-md text-sm bg-slate-100 cursor-not-allowed text-slate-600 focus:outline-none focus:border-blue-500 appearance-none"
            disabled
          >
            <option value="">선택</option>
            {applOptions.map((o) => (
              <option key={o.CODE} value={o.CODE}>
                {o.NAME} ({o.CODE})
              </option>
            ))}
          </select>
          {/* 커스텀 화살표 */}
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </Field>

      {/* ── 다국어 키 (팝업 조회) ── */}
      <Field label="다국어 키 *" error={errors.MSG_CD}>
        <div className="flex gap-1.5">
          <Input
            value={form.MSG_CD}
            readOnly
            placeholder="돋보기 클릭하여 선택"
            className="h-8 text-sm flex-1 bg-slate-50 cursor-pointer"
            onClick={openMsgCdPopup}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2 shrink-0"
            onClick={openMsgCdPopup}
          >
            <Search className="w-3.5 h-3.5" />
          </Button>
        </div>
      </Field>

      {/* ── 메뉴코드 — 다국어키 선택 시 자동 세팅, 직접 수정 가능 ── */}
      <Field
        label="메뉴코드 *"
        error={errors.MENUCODE}
        hint="다국어 키 선택 시 자동 입력. 직접 수정 가능."
      >
        <Input
          value={form.MENUCODE}
          onChange={set("MENUCODE")}
          placeholder="MENU_XXX_YYY"
          className="h-8 text-sm"
        />
      </Field>

      {/* ── 메뉴명 — 다국어키 선택 시 자동 세팅, 직접 수정 가능 ── */}
      <Field label="메뉴명 *" error={errors.MSG_DESC}>
        <Input
          value={form.MSG_DESC}
          onChange={set("MSG_DESC")}
          placeholder="다국어 키 선택 시 자동 입력"
          className="h-8 text-sm"
        />
      </Field>

      {/* ── 정렬순서 ── */}
      <Field label="정렬순서">
        <Input
          type="number"
          min={1}
          value={form.DSPLY_SEQ}
          onChange={set("DSPLY_SEQ")}
          className="h-8 text-sm w-24"
        />
      </Field>

      {/* ── 사용여부 ── */}
      <Field label="사용여부">
        <div className="flex items-center gap-3 h-8">
          {(["Y", "N"] as const).map((v) => (
            <label
              key={v}
              className="flex items-center gap-1.5 text-sm cursor-pointer"
            >
              <input
                type="radio"
                name="folder_use_yn"
                value={v}
                checked={form.USE_YN === v}
                onChange={() => setForm((p) => ({ ...p, USE_YN: v }))}
              />
              {v === "Y" ? "사용" : "미사용"}
            </label>
          ))}
        </div>
      </Field>

      {/* ── 버튼 ── */}
      <div className="flex justify-end gap-2 pt-2 border-t mt-1">
        <Button size="sm" variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button size="sm" variant="outline" onClick={handleConfirm}>
          추가
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
