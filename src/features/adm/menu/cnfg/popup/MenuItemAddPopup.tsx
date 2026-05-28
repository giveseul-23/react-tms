// src/views/MenuConfig/popup/MenuItemAddPopup.tsx
"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Search } from "lucide-react";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import type { MenuRow } from "../MenuConfig";
import { Lang } from "@/app/services/common/Lang";

interface MenuItemAddPopupProps {
  selectedRow: MenuRow | null;
  applOptions: { CODE: string; NAME: string }[];
  onConfirm: (data: MenuItemFormData) => void;
  onClose: () => void;
}

export type MenuItemFormData = {
  APPLCODE: string;
  MENUCODE: string;
  MENUNAME: string;
  MSG_CD: string;
  MSG_DESC: string;
  PARANT_MENU_CD: string;
  SUPERMENUCODE: string;
  DSPLY_SEQ: number;
  URL: string;
  USE_YN: "Y" | "N";
  LEAFYN: "Y";
};

export default function MenuItemAddPopup({
  selectedRow,
  applOptions,
  onConfirm,
  onClose,
}: MenuItemAddPopupProps) {
  const { openPopup, closePopup } = usePopup();

  // 상위 메뉴코드 — 선택된 행 기준으로 고정값 계산
  // 폴더(LEAFYN=N) 선택 → 그 폴더 아래에 추가
  // 일반 행 선택 → 같은 레벨(부모 코드 사용)
  const parentMenuCode =
    selectedRow?.LEAFYN === "N"
      ? selectedRow.MENUCODE
      : (selectedRow?.PARANT_MENU_CD ?? "");

  // 화면에 표시할 레이블 — 코드 + 명칭 함께 보여줌
  const parentMenuLabel = selectedRow
    ? `${parentMenuCode}${selectedRow.MSG_DESC ? ` (${selectedRow.LEAFYN === "N" ? selectedRow.MSG_DESC : ""})` : ""}`.trim()
    : parentMenuCode;

  const defaultAppl = selectedRow?.APPLCODE ?? applOptions[0]?.CODE ?? "";

  const [form, setForm] = useState({
    APPLCODE: defaultAppl,
    MENUCODE: "",
    MENUNAME: "",
    MSG_CD: "",
    MSG_DESC: "",
    DSPLY_SEQ: "1",
    URL: "",
    USE_YN: "Y" as "Y" | "N",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.APPLCODE)
      errs.APPLCODE = Lang.get("MSG_CHK_SELECT", ["LBL_APPLICATION"]);
    if (!form.MENUCODE)
      errs.MENUCODE = Lang.get("MSG_CHK_INPUT", ["LBL_MENU_CD"]);
    if (!form.MENUNAME)
      errs.MENUNAME = Lang.get("MSG_CHK_INPUT", ["LBL_MENU_NM"]);
    if (!form.MSG_CD)
      errs.MSG_CD = Lang.get("MSG_CHK_SELECT", ["LBL_MLT_LANG_KEY"]);
    if (!form.MSG_DESC)
      errs.MSG_DESC = Lang.get("MSG_CHK_INPUT", ["LBL_MENU_NM"]);
    if (!form.URL) errs.URL = Lang.get("MSG_CHK_INPUT", ["LBL_URL_PATH"]);
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
      LEAFYN: "Y",
    });
  };

  // 다국어키 팝업 — 선택 시 MSG_CD, MSG_DESC, MENUCODE 자동 세팅
  const openMsgCdPopup = () => {
    openPopup({
      title: "LBL_LANG_KEY_SEARCH",
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
      <Field label={Lang.get("LBL_PARENT_MENU_CODE")}>
        <Input
          value={parentMenuLabel}
          readOnly
          className="h-8 text-sm bg-slate-100 cursor-not-allowed text-slate-600"
        />
      </Field>

      {/* ── 응용프로그램 ── */}
      <Field label={Lang.get("LBL_APPLICATION")} error={errors.APPLCODE}>
        <div className="relative w-full">
          <select
            value={form.APPLCODE}
            onChange={set("APPLCODE")}
            className="w-full h-8 pl-2 pr-8 border border-slate-200 rounded-md text-sm bg-slate-100 cursor-not-allowed text-slate-600 focus:outline-none focus:border-blue-500 appearance-none"
            disabled
          >
            <option value="">{Lang.get("BTN_TMS_SELECT")}</option>
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
      <Field label={Lang.get("LBL_LANG_KEY")} error={errors.MSG_CD}>
        <div className="flex gap-1.5">
          <Input
            value={form.MSG_CD ?? ""}
            readOnly
            placeholder={Lang.get("MSG_CLICK_SRCH_ICON")}
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
        label={Lang.get("LBL_MENU_CD")}
        error={errors.MENUCODE}
        hint={Lang.get("MSG_MULTILINGUAL_KEY_AUTO_FILL_EDITABLE")}
      >
        <Input
          value={form.MENUCODE ?? ""}
          onChange={set("MENUCODE")}
          placeholder="MENU_XXX_YYY"
          className="h-8 text-sm"
        />
      </Field>

      {/* ── 메뉴명(영문) ── */}
      <Field label={Lang.get("LBL_MENU_NM_EN")} error={errors.MENUNAME}>
        <Input
          value={form.MENUNAME ?? ""}
          onChange={set("MENUNAME")}
          placeholder="Menu Configuration"
          className="h-8 text-sm"
        />
      </Field>

      {/* ── 메뉴명(국문) — 다국어키 선택 시 자동 세팅, 직접 수정 가능 ── */}
      <Field label={Lang.get("LBL_MENU_NM_KR")} error={errors.MSG_DESC}>
        <Input
          value={form.MSG_DESC ?? ""}
          onChange={set("MSG_DESC")}
          placeholder={Lang.get("MSG_MULTILINGUAL_KEY_AUTO_FILL")}
          className="h-8 text-sm"
        />
      </Field>

      {/* ── URL ── */}
      <Field
        label={Lang.get("LBL_URL_PATH")}
        error={errors.URL}
        hint="tms/folder/fileName"
      >
        <Input
          value={form.URL ?? ""}
          onChange={set("URL")}
          placeholder="tms/folder/fileName"
          className="h-8 text-sm font-mono"
        />
      </Field>

      {/* ── 정렬순서 ── */}
      <Field label={Lang.get("LBL_ORDER_BY")}>
        <Input
          type="number"
          min={1}
          value={form.DSPLY_SEQ ?? ""}
          onChange={set("DSPLY_SEQ")}
          className="h-8 text-sm w-24"
        />
      </Field>

      {/* ── 사용여부 ── */}
      <Field label={Lang.get("LBL_USE_YN")}>
        <div className="flex items-center gap-3 h-8">
          {(["Y", "N"] as const).map((v) => (
            <label
              key={v}
              className="flex items-center gap-1.5 text-sm cursor-pointer"
            >
              <input
                type="radio"
                name="menu_use_yn"
                value={v}
                checked={form.USE_YN === v}
                onChange={() => setForm((p) => ({ ...p, USE_YN: v }))}
              />
              {v === "Y" ? Lang.get("LBL_USE") : Lang.get("LBL_NOT_USE")}
            </label>
          ))}
        </div>
      </Field>

      {/* ── 버튼 ── */}
      <div className="flex justify-end gap-2 pt-2 border-t mt-1">
        <Button size="sm" variant="outline" onClick={onClose}>
          {Lang.get("BTN_CANCEL")}
        </Button>
        <Button size="sm" variant="outline" onClick={handleConfirm}>
          {Lang.get("BTN_ADD")}
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
