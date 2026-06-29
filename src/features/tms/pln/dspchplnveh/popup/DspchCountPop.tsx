"use client";

// 배차복사 수량 입력 팝업 — 복사할 배차 건수(DSPCH_CNT) 입력.
// 서버 pop/copyTempDspch/DspchCountPop 대응. 기본값 1, 0 이하 불가.

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  onConfirm: (data: { DSPCH_CNT: number }) => void;
  onClose: () => void;
};

export default function DspchCountPop({ onConfirm, onClose }: Props) {
  const [cnt, setCnt] = useState("1");

  const n = Number(cnt);
  const isValid = Number.isFinite(n) && n > 0;

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel="저장"
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() => onConfirm({ DSPCH_CNT: n })}
    >
      <Field
        layout="vertical"
        type="text"
        required
        label={Lang.get("LBL_DSPCH_COUNT_COPY")}
        value={cnt}
        onChange={(v: string) => setCnt(v.replace(/[^0-9]/g, ""))}
      />
    </FormPopupLayout>
  );
}
