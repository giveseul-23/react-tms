"use client";

import { useMemo, useState } from "react";
import { Lang } from "@/app/services/common/Lang";
import { Button } from "@/app/components/ui/button";

type Props = {
  platform: string;
  packageName: string;
  onConfirm: (file: File) => void;
  onClose: () => void;
};

const MAX_FILE_SIZE = 80 * 1024 * 1024;

export default function MobileAppInstallerUploadPopup({
  platform,
  packageName,
  onConfirm,
  onClose,
}: Props) {
  const [file, setFile] = useState<File | null>(null);

  const isValid = useMemo(() => !!file, [file]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    if (!nextFile) {
      setFile(null);
      return;
    }

    const lowerName = nextFile.name.toLowerCase();
    if (!lowerName.endsWith(".apk")) {
      alert(Lang.get("MSG_ONLY_APK_FILE") || "APK 파일만 업로드할 수 있습니다.");
      event.target.value = "";
      setFile(null);
      return;
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      alert(
        Lang.get("MSG_MAX_UPLOAD_SIZE_EXCEEDED") ||
          "업로드 가능한 최대 용량을 초과했습니다.",
      );
      event.target.value = "";
      setFile(null);
      return;
    }

    setFile(nextFile);
  };

  const handleConfirm = () => {
    if (!file) return;
    onConfirm(file);
  };

  return (
    <div className="w-full space-y-4 text-sm text-slate-700">
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
          <div className="text-[11px] font-medium text-slate-400">
            {Lang.get("LBL_FLAT_FORM")}
          </div>
          <input
            value={platform}
            disabled
            className="h-8 border border-slate-200 bg-slate-50 px-2 text-[12px] text-slate-700 outline-none"
          />
        </div>

        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
          <div className="text-[11px] font-medium text-slate-400">
            {Lang.get("LBL_MBL_PCKG_NM")}
          </div>
          <input
            value={packageName}
            disabled
            className="h-8 border border-slate-200 bg-slate-50 px-2 text-[12px] text-slate-700 outline-none"
          />
        </div>

        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
          <label className="text-[11px] font-medium text-slate-400">
            File
          </label>
          <input
            type="file"
            accept=".apk"
            onChange={handleFileChange}
            className="h-8 border border-slate-200 px-2 py-1 text-[12px] text-slate-700"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="h-7 border-slate-200 px-4 text-xs text-slate-500 hover:bg-slate-50"
        >
          {Lang.get("BTN_CANCEL")}
        </Button>
        <Button
          size="sm"
          onClick={handleConfirm}
          disabled={!isValid}
          className="h-7 bg-slate-800 px-4 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-30"
        >
          {Lang.get("BTN_CONFIRM")}
        </Button>
      </div>
    </div>
  );
}
