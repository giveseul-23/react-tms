// src/views/MenuConfig/popup/MenuFolderAddPopup.tsx
"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Search } from "lucide-react";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import type { MenuRow } from "../MenuConfig";
import { Lang } from "@/app/services/common/Lang";

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
  MENUNAME: string;
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

  // 상위 메뉴코드 — 가상루트(-1) 선택이면 "-1" 그대로 보내고 toNewRow 가
  // __ROOT__${APPLCODE} 로 매핑한다. (MenuItemAddPopup 과 동일 컨벤션)
  const parentMenuCode = selectedRow?.isVirtualRoot
    ? "-1"
    : (selectedRow?.MENUCODE ?? "");

  // 화면 표시용 레이블 — 가상루트면 APPLCODE 노출, 아니면 코드 + 명칭
  const parentMenuLabel = selectedRow?.isVirtualRoot
    ? `${selectedRow.APPLCODE} (최상위)`
    : selectedRow
      ? `${parentMenuCode}${selectedRow.MSG_DESC ? ` (${selectedRow.MSG_DESC})` : ""}`
      : parentMenuCode;

  const defaultAppl = selectedRow?.APPLCODE ?? applOptions[0]?.CODE ?? "";

  const [form, setForm] = useState({
    APPLCODE: defaultAppl,
    MENUCODE: "",
    MSG_CD: "",
    MENUNAME: "",
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
    if (!form.APPLCODE)
      errs.APPLCODE = Lang.get("MSG_CHK_SELECT", ["LBL_APPLICATION"]);
    if (!form.MENUCODE)
      errs.MENUCODE = Lang.get("MSG_CHK_INPUT", ["LBL_MENU_CD"]);
    if (!form.MSG_CD)
      errs.MSG_CD = Lang.get("MSG_CHK_SELECT", ["LBL_MLT_LANG_KEY"]);
    if (!form.MENUNAME)
      errs.MENUNAME = Lang.get("MSG_CHK_INPUT", ["LBL_MENU_NM"]);
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
      MSG_DESC: "",
    });
  };

  // 다국어키 팝업 — 선택 시 MSG_CD, MSG_DESC, MENUCODE 자동 세팅
  const openMsgCdPopup = () => {
    openPopup({
      title: "LBL_MLT_LANG_KEY",
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
              MENUNAME: name,
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
            value={form.MSG_CD}
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
          value={form.MENUCODE}
          onChange={set("MENUCODE")}
          placeholder="MENU_XXX_YYY"
          className="h-8 text-sm"
        />
      </Field>

      {/* ── 메뉴명 — 다국어키 선택 시 자동 세팅, 직접 수정 가능 ── */}
      <Field label={Lang.get("LBL_MENU_NM")} error={errors.MENUNAME}>
        <Input
          value={form.MENUNAME}
          onChange={set("MENUNAME")}
          placeholder={Lang.get("MSG_MULTILINGUAL_KEY_AUTO_FILL")}
          className="h-8 text-sm"
        />
      </Field>

      {/* ── 정렬순서 ── */}
      <Field label={Lang.get("LBL_ORDER_BY")}>
        <Input
          type="number"
          min={1}
          value={form.DSPLY_SEQ}
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
                name="folder_use_yn"
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
