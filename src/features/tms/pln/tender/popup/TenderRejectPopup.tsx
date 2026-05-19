"use client";

import { useState } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";

type RejectReasonContentProps = {
  onConfirm: (data: { reasonCode: string; detail: string }) => void;
  onClose: () => void;
};

export default function RejectReasonContent({
  onConfirm,
  onClose,
}: RejectReasonContentProps) {
  const [reasonCode, setReasonCode] = useState("");
  const [detail, setDetail] = useState("");

  const { stores } = useCommonStores({
    reasonOptions: { sqlProp: "CODE", keyParam: "TNDR_RJT_RSN_CD" },
  });

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      isValid={!!reasonCode}
      onCancel={onClose}
      onConfirm={() => onConfirm({ reasonCode, detail })}
    >
      <Field
        layout="vertical"
        type="combo"
        label="운송요청 거절이유"
        value={reasonCode}
        onChange={setReasonCode}
        options={stores.reasonOptions ?? []}
        placeholder="선택하세요"
      />

      <Field
        layout="vertical"
        type="textarea"
        label="운송요청 거절이유 상세내용"
        rows={5}
        value={detail}
        onChange={setDetail}
        placeholder="상세 내용을 입력하세요"
      />
    </FormPopupLayout>
  );
}
