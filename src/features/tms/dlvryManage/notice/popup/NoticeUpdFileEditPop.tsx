"use client";

// 파일첨부 팝업 (서버 pop/NoticeUpdFileEditPop 대응)
// JPG/PNG 이미지 1개 선택 → uploadImgFile multipart 업로드 → 성공 시 부모 재조회.

import { useRef, useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  onSubmit: (file: File) => void;
  onClose: () => void;
};

const ALLOWED = ["jpg", "jpeg", "png"];

export function NoticeUpdFileEditPop({ onSubmit, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const onPick = (f: File | null) => {
    setError("");
    if (!f) {
      setFile(null);
      return;
    }
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED.includes(ext)) {
      setError("JPG 또는 PNG 파일만 업로드할 수 있습니다.");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setFile(f);
  };

  return (
    <FormPopupLayout
      cardClassName="space-y-3"
      confirmLabel={Lang.get("BTN_FILE_SUBMIT")}
      isValid={!!file}
      onCancel={onClose}
      onConfirm={() => file && onSubmit(file)}
    >
      <label className="block text-sm font-medium text-gray-700">
        {Lang.get("LBL_FILE_ATTACH")} <span className="text-red-500">*</span>
      </label>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        className="w-full text-sm rounded-lg border border-gray-300 p-2"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </FormPopupLayout>
  );
}
