"use client";

// 배송요청 확인문자 발송 팝업 — 물류운영그룹(읽기전용) + 운수사(콤보) 선택 후 발송.
// 서버 pop/sendsmstocarrpop/SendSmsPopCarr 대응. 부모가 /dispatchPlanVehService/sendSmsToCarr 호출.

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  initialValues?: { LGST_GRP_CD?: string };
  // 운수사 콤보 옵션 (CODE | NAME)
  carrOptions: { CODE: string; NAME: string }[];
  onConfirm: (data: { LGST_GRP_CD: string; CARR_CD: string }) => void;
  onClose: () => void;
};

export default function SendSmsPopCarr({
  initialValues = {},
  carrOptions,
  onConfirm,
  onClose,
}: Props) {
  const [carrCd, setCarrCd] = useState("");
  const lgstGrpCd = initialValues.LGST_GRP_CD ?? "";

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel="발송"
      isValid={!!carrCd}
      onCancel={onClose}
      onConfirm={() => onConfirm({ LGST_GRP_CD: lgstGrpCd, CARR_CD: carrCd })}
    >
      <Field
        layout="horizontal"
        type="text"
        disabled
        label={Lang.get("LBL_LOGISTICS_GROUP_CODE")}
        value={lgstGrpCd}
      />
      <Field
        layout="horizontal"
        type="combo"
        label={Lang.get("LBL_CARR_NM")}
        value={carrCd}
        onChange={setCarrCd}
        options={carrOptions}
      />
    </FormPopupLayout>
  );
}
