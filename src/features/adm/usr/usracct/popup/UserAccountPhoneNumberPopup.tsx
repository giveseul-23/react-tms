"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Lang } from "@/app/services/common/Lang";

interface Props {
  initialValue: string;
  onConfirm: (phoneNumber: string) => void;
  onClose: () => void;
}

export default function UserAccountPhoneNumberPopup({
  initialValue,
  onConfirm,
  onClose,
}: Props) {
  const [phoneNumber, setPhoneNumber] = useState(initialValue);

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="grid grid-cols-[100px_1fr] items-center gap-3">
        <label className="text-sm font-medium">{Lang.get("LBL_HP_NO")}</label>
        <Input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9-]/g, ""))}
          placeholder="01012345678"
        />
      </div>

      <div className="flex justify-end gap-2 border-t pt-3">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onClose}
          className="min-w-[72px] border-slate-300 text-slate-700"
        >
          {Lang.get("BTN_CANCEL")}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => onConfirm(phoneNumber)}
          className="min-w-[72px] bg-slate-800 text-white hover:bg-slate-700"
        >
          {Lang.get("BTN_SAVE")}
        </Button>
      </div>
    </div>
  );
}
