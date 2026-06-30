"use client";

// POD 파일 업로드 팝업 (서버 Controller onPodFileUpload 의 인라인 업로드 윈도우 대응)
// 파일 1개 선택 → uploadPodFile multipart 업로드 → 성공 시 부모 재조회.

import { useRef, useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  onSubmit: (file: File) => void;
  onClose: () => void;
};

export function PodFileUploadPop({ onSubmit, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

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
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="w-full text-sm rounded-lg border border-gray-300 p-2"
      />
    </FormPopupLayout>
  );
}
