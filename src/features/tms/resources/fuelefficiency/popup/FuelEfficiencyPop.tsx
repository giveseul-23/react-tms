"use client";

import { useMemo, useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  defaultFeId: string;
  defaultFrmDt: string;
  defaultToDt: string;
  onApply: (values: {
    FE_ID: string;
    FRM_DT: string;
    TO_DT: string;
  }) => void;
  onClose: () => void;
};

export function FuelEfficiencyPop({
  defaultFeId,
  defaultFrmDt,
  defaultToDt,
  onApply,
  onClose,
}: Props) {
  const [feId, setFeId] = useState(defaultFeId);
  const [frmDt, setFrmDt] = useState(defaultFrmDt);
  const [toDt, setToDt] = useState(defaultToDt);

  const isValid = useMemo(
    () =>
      String(feId).trim() !== "" &&
      String(frmDt).trim() !== "" &&
      String(toDt).trim() !== "" &&
      frmDt <= toDt,
    [feId, frmDt, toDt],
  );

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      cancelLabel={Lang.get("BTN_CANCEL")}
      confirmLabel={Lang.get("BTN_SAVE")}
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() =>
        onApply({ FE_ID: feId, FRM_DT: frmDt, TO_DT: toDt })
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
        value={frmDt}
        onChange={setFrmDt}
      />
      <Field
        layout="vertical"
        type="text"
        label={Lang.get("LBL_TO_DATE")}
        required
        value={toDt}
        onChange={setToDt}
      />
    </FormPopupLayout>
  );
}
