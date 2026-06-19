"use client";

import { useState } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { Lang } from "@/app/services/common/Lang";

type TenderRejectPopupProps = {
  onConfirm: (data: { reasonCode: string; detail: string }) => void;
  onClose: () => void;
};

export default function TenderRejectPopup({
  onConfirm,
  onClose,
}: TenderRejectPopupProps) {
  const [reasonCode, setReasonCode] = useState("");
  const [detail, setDetail] = useState("");

  const { stores } = useCommonStores({
    reasonOptions: { sqlProp: "CODE", keyParam: "TNDR_RJT_RSN_CD" },
  });

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      cancelLabel={Lang.get("BTN_CANCEL")}
      confirmLabel={Lang.get("BTN_SAVE")}
      isValid={!!reasonCode}
      onCancel={onClose}
      onConfirm={() => onConfirm({ reasonCode, detail })}
    >
      <Field
        layout="vertical"
        type="combo"
        label={Lang.get("LBL_TNDR_RJT_RSN_CD")}
        value={reasonCode}
        onChange={setReasonCode}
        options={stores.reasonOptions ?? []}
        placeholder="선택하세요"
      />

      <Field
        layout="vertical"
        type="textarea"
        label={Lang.get("LBL_TNDR_RJT_RSN_DTL_DESC")}
        rows={5}
        value={detail}
        onChange={setDetail}
        placeholder="상세 내용을 입력하세요"
      />
    </FormPopupLayout>
  );
}
