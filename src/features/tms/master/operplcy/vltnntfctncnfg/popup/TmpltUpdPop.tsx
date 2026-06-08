"use client";

// 알림메시지 템플릿 수정 팝업 (센차 TmpltUpdPop)
// 선택 채널행의 메시지 템플릿(NTFCTN_MSG_TMPLT)을 수정해 부모에 전달.

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  initial: any;
  onConfirm: (params: {
    VLTN_NTFCTN_CNFG_ID: any;
    NTFCTN_CHNL_TCD: any;
    NTFCTN_MSG_TMPLT: string;
    USE_YN: any;
  }) => void;
  onClose: () => void;
};

export default function TmpltUpdPop({ initial, onConfirm, onClose }: Props) {
  const [msg, setMsg] = useState(initial?.NTFCTN_MSG_TMPLT ?? "");

  return (
    <FormPopupLayout
      confirmLabel={Lang.get("BTN_SAVE")}
      cancelLabel={Lang.get("BTN_CANCEL")}
      isValid={!!msg.trim()}
      onCancel={onClose}
      onConfirm={() =>
        onConfirm({
          VLTN_NTFCTN_CNFG_ID: initial?.VLTN_NTFCTN_CNFG_ID,
          NTFCTN_CHNL_TCD: initial?.NTFCTN_CHNL_TCD,
          NTFCTN_MSG_TMPLT: msg,
          USE_YN: initial?.USE_YN,
        })
      }
    >
      <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
        {Lang.get("LBL_NTFCTN_MSG_TMPLT")}
      </label>
      <textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        rows={6}
        className="w-full rounded-lg border border-gray-300 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </FormPopupLayout>
  );
}
