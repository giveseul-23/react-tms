"use client";

import { useMemo, useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  defaultFeId: string;
  defaultFrmDttm: string;
  defaultToDttm: string;
  onApply: (values: {
    FE_ID: string;
    FRM_DTTM: string;
    TO_DTTM: string;
  }) => void;
  onClose: () => void;
};

export function FuelEfficiencyPop({
  defaultFeId,
  defaultFrmDttm,
  defaultToDttm,
  onApply,
  onClose,
}: Props) {
  const [feId, setFeId] = useState(defaultFeId);
  const [frmDttm, setFrmDttm] = useState(defaultFrmDttm);
  const [toDttm, setToDttm] = useState(defaultToDttm);

  const isValid = useMemo(
    () =>
      String(feId).trim() !== "" &&
      String(frmDttm).trim() !== "" &&
      String(toDttm).trim() !== "" &&
      frmDttm <= toDttm,
    [feId, frmDttm, toDttm],
  );

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      cancelLabel={Lang.get("BTN_CANCEL")}
      confirmLabel={Lang.get("BTN_SAVE")}
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() =>
        onApply({ FE_ID: feId, FRM_DTTM: frmDttm, TO_DTTM: toDttm })
      }
    >
      <Field
        layout="vertical"
        type="text"
        label={Lang.get("LBL_FUEL_EFFICIENCY_ID")}
        required
        value={feId}
        onChange={setFeId}
      />
      <Field
        layout="vertical"
        type="text"
        label={Lang.get("LBL_FROM_DATE")}
        required
        value={frmDttm}
        onChange={setFrmDttm}
      />
      <Field
        layout="vertical"
        type="text"
        label={Lang.get("LBL_TO_DATE")}
        required
        value={toDttm}
        onChange={setToDttm}
      />
    </FormPopupLayout>
  );
}
